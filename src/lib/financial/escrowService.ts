import prisma from "@/lib/prisma";
import {
  CampaignStatus,
  ContributionStatus,
  MilestoneStatus,
  TransactionStatus,
  TransactionType,
  WalletStatus,
} from "@prisma/client";
import { generateReference } from "./walletService";

/**
 * Pledges funds to a campaign, locking the amount into Escrow
 */
export async function pledgeToCampaign({
  userId,
  campaignId,
  amount,
  comment,
  anonymous = false,
}: {
  userId: string;
  campaignId: string;
  amount: number;
  comment?: string;
  anonymous?: boolean;
}) {
  if (amount <= 0) {
    throw new Error("Pledge amount must be greater than zero");
  }

  const pledgeRef = generateReference("TX_PLEDGE");

  return await prisma.$transaction(async (tx) => {
    // 1. Validate Campaign
    const campaign = await tx.crowdfundingCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error("Crowdfunding campaign not found");
    }

    if (campaign.status !== CampaignStatus.ACTIVE && campaign.status !== CampaignStatus.FULLY_FUNDED) {
      throw new Error(`Campaign is not accepting pledges (status: ${campaign.status})`);
    }

    if (campaign.deadline && new Date() > campaign.deadline) {
      throw new Error("Campaign deadline has passed");
    }

    if (campaign.minPledge && amount < campaign.minPledge) {
      throw new Error(`Minimum pledge amount is $${campaign.minPledge}`);
    }

    // 2. Validate User Wallet
    let wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          userId,
          balance: 0.0,
          escrowBalance: 0.0,
          currency: campaign.currency,
          status: WalletStatus.ACTIVE,
        },
      });
    }

    if (wallet.balance < amount) {
      throw new Error(
        `Insufficient wallet balance. You have $${wallet.balance.toFixed(2)}, pledge requires $${amount.toFixed(2)}.`
      );
    }

    // 3. Move funds from available balance to escrow
    const newBal = Math.round((wallet.balance - amount) * 100) / 100;
    const newEscrowBal = Math.round((wallet.escrowBalance + amount) * 100) / 100;

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: newBal,
        escrowBalance: newEscrowBal,
      },
    });

    // 4. Update Campaign Raised Amount
    const newRaised = Math.round((campaign.raisedAmount + amount) * 100) / 100;
    const isFullyFunded = newRaised >= campaign.targetAmount;

    const updatedCampaign = await tx.crowdfundingCampaign.update({
      where: { id: campaign.id },
      data: {
        raisedAmount: newRaised,
        status: isFullyFunded && campaign.status === CampaignStatus.ACTIVE ? CampaignStatus.FULLY_FUNDED : campaign.status,
      },
    });

    // 5. Create Contribution Record
    const contribution = await tx.campaignContribution.create({
      data: {
        campaignId: campaign.id,
        userId,
        amount,
        anonymous,
        comment,
        status: ContributionStatus.ESCROWED,
      },
    });

    // 6. Record Wallet Transaction
    const transaction = await tx.walletTransaction.create({
      data: {
        reference: pledgeRef,
        walletId: wallet.id,
        userId,
        type: TransactionType.CAMPAIGN_PLEDGE,
        amount: -amount,
        balanceAfter: newBal,
        status: TransactionStatus.COMPLETED,
        narration: `Escrow pledge to "${campaign.title}"`,
        metadata: { campaignId: campaign.id, contributionId: contribution.id },
      },
    });

    // 7. Audit Log
    await tx.financialAuditLog.create({
      data: {
        actorId: userId,
        actorRole: "member",
        action: "payment.contribution",
        entityType: "campaign",
        entityId: campaign.id,
        amount,
        beforeState: { raisedAmount: campaign.raisedAmount },
        afterState: { raisedAmount: newRaised },
        metadata: { pledgeRef, contributionId: contribution.id },
      },
    });

    return {
      contribution,
      transaction,
      campaign: updatedCampaign,
      wallet: { ...wallet, balance: newBal, escrowBalance: newEscrowBal },
    };
  });
}

/**
 * Campaign creator submits proof of milestone deliverables
 */
export async function submitMilestoneProof({
  milestoneId,
  creatorId,
  proofOfWork,
}: {
  milestoneId: string;
  creatorId: string;
  proofOfWork: string;
}) {
  const milestone = await prisma.campaignMilestone.findUnique({
    where: { id: milestoneId },
    include: { campaign: true },
  });

  if (!milestone) {
    throw new Error("Milestone not found");
  }

  if (milestone.campaign.creatorId !== creatorId) {
    throw new Error("Only the campaign creator can submit milestone deliverables");
  }

  return await prisma.campaignMilestone.update({
    where: { id: milestoneId },
    data: {
      proofOfWork,
      status: MilestoneStatus.SUBMITTED,
    },
  });
}

/**
 * Community Admin or Trustee approves a milestone and releases escrow funds to creator
 */
export async function approveAndReleaseMilestone({
  milestoneId,
  approverId,
  actorRole = "admin",
}: {
  milestoneId: string;
  approverId: string;
  actorRole?: string;
}) {
  const releaseRef = generateReference("TX_ESC_REL");

  return await prisma.$transaction(async (tx) => {
    const milestone = await tx.campaignMilestone.findUnique({
      where: { id: milestoneId },
      include: {
        campaign: {
          include: {
            creator: true,
            contributions: { where: { status: ContributionStatus.ESCROWED } },
          },
        },
      },
    });

    if (!milestone) {
      throw new Error("Milestone not found");
    }

    if (milestone.status === MilestoneStatus.RELEASED) {
      throw new Error("Milestone funds have already been released");
    }

    const trancheAmount = milestone.targetAmount;
    const creatorId = milestone.campaign.creatorId;

    // 1. Find or create Creator Wallet
    let creatorWallet = await tx.wallet.findUnique({ where: { userId: creatorId } });
    if (!creatorWallet) {
      creatorWallet = await tx.wallet.create({
        data: {
          userId: creatorId,
          balance: 0.0,
          escrowBalance: 0.0,
          currency: milestone.campaign.currency,
          status: WalletStatus.ACTIVE,
        },
      });
    }

    // 2. Credit Creator available balance
    const updatedCreatorBal = Math.round((creatorWallet.balance + trancheAmount) * 100) / 100;
    await tx.wallet.update({
      where: { id: creatorWallet.id },
      data: { balance: updatedCreatorBal },
    });

    // 3. Mark milestone as RELEASED
    const updatedMilestone = await tx.campaignMilestone.update({
      where: { id: milestoneId },
      data: {
        status: MilestoneStatus.RELEASED,
        approvedBy: approverId,
        releasedAt: new Date(),
      },
    });

    // 4. Create release transaction for creator
    const creatorTx = await tx.walletTransaction.create({
      data: {
        reference: releaseRef,
        walletId: creatorWallet.id,
        userId: creatorId,
        type: TransactionType.ESCROW_RELEASE,
        amount: trancheAmount,
        balanceAfter: updatedCreatorBal,
        status: TransactionStatus.COMPLETED,
        narration: `Escrow release for milestone "${milestone.title}" in "${milestone.campaign.title}"`,
        metadata: {
          campaignId: milestone.campaignId,
          milestoneId: milestone.id,
          approverId,
        },
      },
    });

    // 5. Audit Log
    await tx.financialAuditLog.create({
      data: {
        actorId: approverId,
        actorRole,
        action: "payment.grant_released",
        entityType: "milestone",
        entityId: milestone.id,
        amount: trancheAmount,
        metadata: { releaseRef, creatorId, campaignId: milestone.campaignId },
      },
    });

    // 6. Check if all milestones are released; if so, mark campaign COMPLETED
    const remainingMilestones = await tx.campaignMilestone.count({
      where: {
        campaignId: milestone.campaignId,
        status: { not: MilestoneStatus.RELEASED },
      },
    });

    if (remainingMilestones === 0) {
      await tx.crowdfundingCampaign.update({
        where: { id: milestone.campaignId },
        data: { status: CampaignStatus.COMPLETED },
      });
    }

    return {
      milestone: updatedMilestone,
      creatorWallet: { ...creatorWallet, balance: updatedCreatorBal },
      transaction: creatorTx,
    };
  });
}

/**
 * Refund all escrowed pledges back to contributors if campaign is cancelled
 */
export async function refundCampaignPledges({
  campaignId,
  reason = "Campaign cancelled",
  actorId,
}: {
  campaignId: string;
  reason?: string;
  actorId: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const campaign = await tx.crowdfundingCampaign.findUnique({
      where: { id: campaignId },
      include: {
        contributions: {
          where: { status: ContributionStatus.ESCROWED },
          include: { user: true },
        },
      },
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Process refund for each contribution
    for (const contribution of campaign.contributions) {
      const userWallet = await tx.wallet.findUnique({ where: { userId: contribution.userId } });
      if (userWallet) {
        const refundedBal = Math.round((userWallet.balance + contribution.amount) * 100) / 100;
        const refundedEscrow = Math.max(0, Math.round((userWallet.escrowBalance - contribution.amount) * 100) / 100);

        await tx.wallet.update({
          where: { id: userWallet.id },
          data: {
            balance: refundedBal,
            escrowBalance: refundedEscrow,
          },
        });

        await tx.walletTransaction.create({
          data: {
            reference: generateReference("TX_REFUND"),
            walletId: userWallet.id,
            userId: contribution.userId,
            type: TransactionType.ESCROW_REFUND,
            amount: contribution.amount,
            balanceAfter: refundedBal,
            status: TransactionStatus.COMPLETED,
            narration: `Escrow refund for "${campaign.title}": ${reason}`,
            metadata: { campaignId, contributionId: contribution.id },
          },
        });

        await tx.campaignContribution.update({
          where: { id: contribution.id },
          data: { status: ContributionStatus.REFUNDED },
        });
      }
    }

    await tx.crowdfundingCampaign.update({
      where: { id: campaignId },
      data: { status: CampaignStatus.CANCELLED },
    });

    await tx.financialAuditLog.create({
      data: {
        actorId,
        actorRole: "admin",
        action: "payment.reversed",
        entityType: "campaign",
        entityId: campaignId,
        metadata: { reason },
      },
    });

    return { success: true, refundedContributionsCount: campaign.contributions.length };
  });
}
