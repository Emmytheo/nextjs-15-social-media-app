import prisma from "@/lib/prisma";
import { TransactionStatus, TransactionType, WalletStatus } from "@prisma/client";

/**
 * Generate unique, audit-grade transaction reference
 */
export function generateReference(prefix: string = "TX"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${rand}`;
}

/**
 * Retrieves a user's wallet or lazy-initializes an active wallet if none exists
 */
export async function getOrCreateUserWallet(userId: string) {
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0.0,
        escrowBalance: 0.0,
        currency: "USD",
        status: WalletStatus.ACTIVE,
      },
    });
  }

  return wallet;
}

/**
 * Retrieves wallet with recent transaction history
 */
export async function getWalletWithLedger(userId: string, limit = 50) {
  const wallet = await getOrCreateUserWallet(userId);

  const transactions = await prisma.walletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return {
    wallet,
    transactions,
  };
}

/**
 * Deposit funds into user wallet (e.g. simulated MFB/Paystack/Card clearing)
 */
export async function depositToWallet({
  userId,
  amount,
  reference,
  narration = "Wallet deposit via instant clearing",
  metadata,
}: {
  userId: string;
  amount: number;
  reference?: string;
  narration?: string;
  metadata?: any;
}) {
  if (amount <= 0) {
    throw new Error("Deposit amount must be greater than zero");
  }

  const txRef = reference || generateReference("TX_DEP");

  return await prisma.$transaction(async (tx) => {
    // Ensure wallet exists
    let wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          userId,
          balance: 0.0,
          escrowBalance: 0.0,
          currency: "USD",
          status: WalletStatus.ACTIVE,
        },
      });
    }

    if (wallet.status === WalletStatus.FROZEN) {
      throw new Error("Wallet is frozen. Please contact community administration.");
    }

    const newBalance = Math.round((wallet.balance + amount) * 100) / 100;

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    });

    const txRecord = await tx.walletTransaction.create({
      data: {
        reference: txRef,
        walletId: wallet.id,
        userId,
        type: TransactionType.DEPOSIT,
        amount,
        balanceAfter: newBalance,
        status: TransactionStatus.COMPLETED,
        narration,
        metadata: metadata || {},
      },
    });

    await tx.financialAuditLog.create({
      data: {
        actorId: userId,
        actorRole: "member",
        action: "payment.topup",
        entityType: "wallet",
        entityId: wallet.id,
        amount,
        beforeState: { balance: wallet.balance },
        afterState: { balance: newBalance },
        metadata: { reference: txRef },
      },
    });

    return { wallet: updatedWallet, transaction: txRecord };
  });
}

/**
 * Peer-to-peer or member-to-treasury wallet transfer with double-entry accounting
 */
export async function transferWalletFunds({
  senderId,
  recipientIdentifier,
  amount,
  narration = "Community peer-to-peer transfer",
}: {
  senderId: string;
  recipientIdentifier: string; // username, email, or userId
  amount: number;
  narration?: string;
}) {
  if (amount <= 0) {
    throw new Error("Transfer amount must be greater than zero");
  }

  // Find recipient by userId, username, or email
  const recipient = await prisma.user.findFirst({
    where: {
      OR: [
        { id: recipientIdentifier },
        { username: { equals: recipientIdentifier, mode: "insensitive" } },
        { email: { equals: recipientIdentifier, mode: "insensitive" } },
      ],
    },
  });

  if (!recipient) {
    throw new Error("Recipient citizen not found. Please check username or email.");
  }

  if (recipient.id === senderId) {
    throw new Error("Cannot transfer funds to yourself.");
  }

  const senderRef = generateReference("TX_TRF_OUT");
  const recipientRef = generateReference("TX_TRF_IN");

  return await prisma.$transaction(async (tx) => {
    // 1. Get sender wallet
    const senderWallet = await tx.wallet.findUnique({ where: { userId: senderId } });
    if (!senderWallet || senderWallet.balance < amount) {
      throw new Error(`Insufficient funds. Available balance: $${senderWallet?.balance?.toFixed(2) || "0.00"}`);
    }

    if (senderWallet.status === WalletStatus.FROZEN) {
      throw new Error("Sender wallet is frozen.");
    }

    // 2. Get or create recipient wallet
    let recipientWallet = await tx.wallet.findUnique({ where: { userId: recipient.id } });
    if (!recipientWallet) {
      recipientWallet = await tx.wallet.create({
        data: {
          userId: recipient.id,
          balance: 0.0,
          escrowBalance: 0.0,
          currency: "USD",
          status: WalletStatus.ACTIVE,
        },
      });
    }

    // 3. Debit sender
    const senderNewBal = Math.round((senderWallet.balance - amount) * 100) / 100;
    await tx.wallet.update({
      where: { id: senderWallet.id },
      data: { balance: senderNewBal },
    });

    const debitTx = await tx.walletTransaction.create({
      data: {
        reference: senderRef,
        walletId: senderWallet.id,
        userId: senderId,
        type: TransactionType.TRANSFER_OUT,
        amount: -amount,
        balanceAfter: senderNewBal,
        status: TransactionStatus.COMPLETED,
        narration: `${narration} to @${recipient.username}`,
        metadata: { counterpartyId: recipient.id, counterpartyUsername: recipient.username },
      },
    });

    // 4. Credit recipient
    const recipientNewBal = Math.round((recipientWallet.balance + amount) * 100) / 100;
    await tx.wallet.update({
      where: { id: recipientWallet.id },
      data: { balance: recipientNewBal },
    });

    const creditTx = await tx.walletTransaction.create({
      data: {
        reference: recipientRef,
        walletId: recipientWallet.id,
        userId: recipient.id,
        type: TransactionType.TRANSFER_IN,
        amount,
        balanceAfter: recipientNewBal,
        status: TransactionStatus.COMPLETED,
        narration: `${narration} from community member`,
        metadata: { counterpartyId: senderId },
      },
    });

    // 5. Audit logs
    await tx.financialAuditLog.create({
      data: {
        actorId: senderId,
        actorRole: "member",
        action: "payment.transfer",
        entityType: "wallet",
        entityId: senderWallet.id,
        amount,
        beforeState: { balance: senderWallet.balance },
        afterState: { balance: senderNewBal },
        metadata: { senderRef, recipientRef, recipientId: recipient.id },
      },
    });

    return {
      senderWallet: { ...senderWallet, balance: senderNewBal },
      debitTransaction: debitTx,
      creditTransaction: creditTx,
      recipientUsername: recipient.username,
    };
  });
}

/**
 * Retrieves an organization guild's treasury wallet or lazy-initializes if none exists
 */
export async function getOrCreateOrgWallet(organizationId: string) {
  let wallet = await prisma.wallet.findUnique({
    where: { organizationId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
        },
      },
    },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        organizationId,
        balance: 0.0,
        escrowBalance: 0.0,
        currency: "USD",
        status: WalletStatus.ACTIVE,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });
  }

  return wallet;
}

/**
 * Retrieves organization treasury wallet with transaction ledger
 */
export async function getOrgWalletWithLedger(organizationId: string, limit = 50) {
  const wallet = await getOrCreateOrgWallet(organizationId);

  const transactions = await prisma.walletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return {
    wallet,
    transactions,
  };
}

/**
 * Deposit funds into organization guild treasury
 */
export async function depositToOrgWallet({
  organizationId,
  actorId,
  amount,
  reference,
  narration = "Guild treasury capital contribution",
  metadata,
}: {
  organizationId: string;
  actorId: string;
  amount: number;
  reference?: string;
  narration?: string;
  metadata?: any;
}) {
  if (amount <= 0) {
    throw new Error("Deposit amount must be greater than zero");
  }

  const txRef = reference || generateReference("TX_ORG_DEP");

  return await prisma.$transaction(async (tx) => {
    let wallet = await tx.wallet.findUnique({ where: { organizationId } });
    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          organizationId,
          balance: 0.0,
          escrowBalance: 0.0,
          currency: "USD",
          status: WalletStatus.ACTIVE,
        },
      });
    }

    if (wallet.status === WalletStatus.FROZEN) {
      throw new Error("Guild treasury is frozen. Contact platform administration.");
    }

    const newBalance = Math.round((wallet.balance + amount) * 100) / 100;

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    });

    const txRecord = await tx.walletTransaction.create({
      data: {
        reference: txRef,
        walletId: wallet.id,
        userId: actorId,
        type: TransactionType.DEPOSIT,
        amount,
        balanceAfter: newBalance,
        status: TransactionStatus.COMPLETED,
        narration,
        metadata: metadata || {},
      },
    });

    await tx.financialAuditLog.create({
      data: {
        actorId,
        actorRole: "steward",
        action: "treasury.deposit",
        entityType: "wallet",
        entityId: wallet.id,
        amount,
        beforeState: { balance: wallet.balance },
        afterState: { balance: newBalance },
        metadata: { reference: txRef, organizationId },
      },
    });

    return { wallet: updatedWallet, transaction: txRecord };
  });
}

