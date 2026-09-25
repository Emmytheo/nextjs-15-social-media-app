import { validateRequest } from "@/auth";
import { approveAndReleaseMilestone, pledgeToCampaign, submitMilestoneProof } from "@/lib/financial/escrowService";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const SHOWCASE_DETAILS: Record<string, any> = {
  "showcase-clean-water-project": {
    id: "showcase-clean-water-project",
    slug: "abia-clean-water-solar-borehole",
    title: "Abia Clean Water & Solar Borehole Project",
    tagline: "Providing clean solar-powered drinking water to 5,000 residents across rural farming clusters.",
    description: "This civic initiative delivers two deep-drilled solar boreholes with automated filtration and community tap stations. Funds are protected by milestone escrow and released in 3 verifiable phases.",
    coverUrl: "/img/logo.png",
    category: "COMMUNITY_PROJECT",
    targetAmount: 12500,
    raisedAmount: 8750,
    currency: "USD",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 22).toISOString(),
    status: "ACTIVE",
    escrowEnabled: true,
    minPledge: 10,
    creator: {
      id: "alice-admin",
      username: "alice_admin",
      displayName: "Alice Chen",
      avatarUrl: "/img/icon.png",
      bio: "Tech enthusiast and civic organizer",
    },
    organization: {
      id: "community-builders",
      name: "Community Builders Network",
      logoUrl: "/img/logo.png",
      description: "Empowering communities through meaningful engagement and sustainable development.",
    },
    milestones: [
      { id: "m-1", title: "Geological Survey & Aquifer Drilling", description: "Hydrological testing and core sample collection.", targetAmount: 4000, percentage: 32, order: 1, proofOfWork: "Drilling log ref #AK-928 verified by municipal engineer.", status: "RELEASED", approvedBy: "Trustee Board", releasedAt: new Date().toISOString() },
      { id: "m-2", title: "Solar Pump & Steel Tank Rigging", description: "Installation of 5kW solar array and 10,000L tank.", targetAmount: 5000, percentage: 40, order: 2, proofOfWork: "Photos and contractor invoices submitted for review.", status: "APPROVED", approvedBy: "Alice Chen", releasedAt: null },
      { id: "m-3", title: "Purification Filters & Community Taps", description: "Final pipe installation and water quality certification.", targetAmount: 3500, percentage: 28, order: 3, proofOfWork: null, status: "LOCKED", approvedBy: null, releasedAt: null },
    ],
    contributions: [
      { id: "c-1", amount: 250, anonymous: false, comment: "Essential work for our farming community!", status: "ESCROWED", createdAt: new Date(Date.now() - 3600000).toISOString(), user: { id: "u-1", username: "emmytheo", displayName: "Emmy Theo", avatarUrl: null } },
      { id: "c-2", amount: 100, anonymous: false, comment: "Proud to back this.", status: "ESCROWED", createdAt: new Date(Date.now() - 7200000).toISOString(), user: { id: "u-2", username: "david_member", displayName: "David Park", avatarUrl: null } },
    ],
  },
  "showcase-financial-sdk": {
    id: "showcase-financial-sdk",
    slug: "communityos-financial-sdk",
    title: "CommunityOS Open Source Financial Rails SDK",
    tagline: "Developer toolkit for bridging cooperative thrifts, ajo pools, and Copteller MFB escrow ledgers.",
    description: "A comprehensive TypeScript SDK enabling any community, church, or cooperative to deploy audited milestone escrow contracts and transparent treasury ledgers.",
    coverUrl: "/img/icon.png",
    category: "TECH_INNOVATION",
    targetAmount: 25000,
    raisedAmount: 19400,
    currency: "USD",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35).toISOString(),
    status: "ACTIVE",
    escrowEnabled: true,
    minPledge: 25,
    creator: {
      id: "bob-organizer",
      username: "bob_organizer",
      displayName: "Bob Wilson",
      avatarUrl: "/img/logo.png",
      bio: "Fintech engineer & cooperative organizer",
    },
    organization: {
      id: "tech-innovation-hub",
      name: "Tech Innovation Hub",
      logoUrl: "/img/icon.png",
      description: "Leading the future of technology through innovation, education, and collaboration.",
    },
    milestones: [
      { id: "m-4", title: "Double-Entry Ledger Core Engine", description: "Cryptographic double-entry ledger algorithms and testing.", targetAmount: 7000, percentage: 28, order: 1, proofOfWork: "GitHub PR #42 merged with 100% test coverage.", status: "RELEASED", approvedBy: "Tech Hub Review", releasedAt: new Date().toISOString() },
      { id: "m-5", title: "Multi-Rail MFB Clearing Adapter", description: "Adapter for ACH, NIP virtual accounts and card rails.", targetAmount: 8000, percentage: 32, order: 2, proofOfWork: "Copteller sandbox clearing integration passed.", status: "RELEASED", approvedBy: "Copteller Lead", releasedAt: new Date().toISOString() },
      { id: "m-6", title: "Next.js 15 UI Component Library", description: "Holographic cards, escrow roadmaps, and drawer dialogs.", targetAmount: 10000, percentage: 40, order: 3, proofOfWork: "Delivered live component preview in CommunityOS.", status: "SUBMITTED", approvedBy: null, releasedAt: null },
    ],
    contributions: [
      { id: "c-3", amount: 500, anonymous: false, comment: "Transformative infrastructure for community banking.", status: "ESCROWED", createdAt: new Date(Date.now() - 5400000).toISOString(), user: { id: "u-3", username: "carol_member", displayName: "Carol Davis", avatarUrl: null } },
    ],
  },
  "showcase-creative-audio": {
    id: "showcase-creative-audio",
    slug: "youth-creative-sound-lab",
    title: "Youth Creative Media & Podcast Lab",
    tagline: "Equipping young civic storytellers with acoustic recording gear and sound production training.",
    description: "Establishing an open-access podcast and sound recording lab powered by Sol2Snd acoustic tools for community journalists and musicians.",
    coverUrl: "/img/logo.png",
    category: "CREATIVE_GRANT",
    targetAmount: 6500,
    raisedAmount: 5200,
    currency: "USD",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    status: "ACTIVE",
    escrowEnabled: true,
    minPledge: 15,
    creator: {
      id: "carol-member",
      username: "carol_member",
      displayName: "Carol Davis",
      avatarUrl: "/img/icon.png",
      bio: "Audio artist and community journalist",
    },
    organization: {
      id: "tech-innovation-hub",
      name: "Creative Media Guild",
      logoUrl: "/img/logo.png",
      description: "Audio and media collective.",
    },
    milestones: [
      { id: "m-7", title: "Acoustic Treatment & Microphones", description: "Studio foam and Shure MV7 podcast microphones.", targetAmount: 3500, percentage: 54, order: 1, proofOfWork: "Studio equipment unboxing and installation verified.", status: "RELEASED", approvedBy: "Guild Trustee", releasedAt: new Date().toISOString() },
      { id: "m-8", title: "Digital Audio Workstation & Masterclass", description: "Hardware interfaces and 4-week student workshop.", targetAmount: 3000, percentage: 46, order: 2, proofOfWork: "Workshop syllabus and attendance sheets submitted.", status: "APPROVED", approvedBy: "Alice Chen", releasedAt: null },
    ],
    contributions: [],
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;

    const campaign = await prisma.crowdfundingCampaign.findFirst({
      where: {
        OR: [{ id: campaignId }, { slug: campaignId }],
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            description: true,
          },
        },
        milestones: {
          orderBy: { order: "asc" },
        },
        contributions: {
          take: 50,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    const { user } = await validateRequest();

    if (!campaign) {
      const showcase = SHOWCASE_DETAILS[campaignId] || Object.values(SHOWCASE_DETAILS).find((c: any) => c.slug === campaignId);
      if (showcase) {
        const isCreator = user ? showcase.creator.id === user.id : false;
        const permissions = {
          isCreator,
          isOrgAdmin: false,
          isBacker: false,
          canSubmitProof: isCreator,
          canApproveRelease: !isCreator,
        };
        return NextResponse.json({ campaign: showcase, permissions });
      }
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const isCreator = user ? campaign.creatorId === user.id : false;
    let isOrgAdmin = false;
    if (user && campaign.organizationId) {
      const orgAdmin = await prisma.organizationAdmin.findUnique({
        where: { userId_organizationId: { userId: user.id, organizationId: campaign.organizationId } },
      });
      isOrgAdmin = !!orgAdmin;
    }
    const isBacker = user
      ? campaign.contributions.some((c) => c.userId === user.id)
      : false;

    const permissions = {
      isCreator,
      isOrgAdmin,
      isBacker,
      canSubmitProof: isCreator,
      canApproveRelease: !isCreator && (isOrgAdmin || isBacker),
    };

    return NextResponse.json({ campaign, permissions });
  } catch (error: any) {
    console.error("Fetch campaign detail error:", error);
    return NextResponse.json({ error: error.message || "Failed to load campaign" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { campaignId } = await params;
    const body = await req.json();
    const { amount, comment, anonymous } = body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Invalid pledge amount" }, { status: 400 });
    }

    // Resolve campaign ID in case slug was provided
    const campaign = await prisma.crowdfundingCampaign.findFirst({
      where: { OR: [{ id: campaignId }, { slug: campaignId }] },
      select: { id: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const result = await pledgeToCampaign({
      userId: user.id,
      campaignId: campaign.id,
      amount: parsedAmount,
      comment,
      anonymous: !!anonymous,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Campaign pledge error:", error);
    return NextResponse.json({ error: error.message || "Failed to process pledge" }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { campaignId } = await params;
    const body = await req.json();
    const { action, milestoneId, proofOfWork } = body;

    if (!milestoneId) {
      return NextResponse.json({ error: "Milestone ID is required" }, { status: 400 });
    }

    // Resolve campaign with organization admins and user contributions
    const campaign = await prisma.crowdfundingCampaign.findFirst({
      where: { OR: [{ id: campaignId }, { slug: campaignId }] },
      include: {
        organization: {
          include: {
            admins: { where: { userId: user.id } },
          },
        },
        contributions: {
          where: { userId: user.id },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (action === "submit_proof") {
      if (!proofOfWork || typeof proofOfWork !== "string" || !proofOfWork.trim()) {
        return NextResponse.json({ error: "Proof of work deliverables are required" }, { status: 400 });
      }

      if (campaign.creatorId !== user.id) {
        return NextResponse.json(
          { error: "Forbidden: Only the project creator can submit deliverables for this campaign." },
          { status: 403 }
        );
      }

      const updatedMilestone = await submitMilestoneProof({
        milestoneId,
        creatorId: user.id,
        proofOfWork: proofOfWork.trim(),
      });

      return NextResponse.json({ success: true, milestone: updatedMilestone });
    }

    if (action === "approve_release") {
      // Prohibit campaign creator from approving their own fund release
      if (campaign.creatorId === user.id) {
        return NextResponse.json(
          { error: "Conflict of Interest: Campaign creators cannot approve their own milestone releases." },
          { status: 403 }
        );
      }

      const isOrgAdmin = campaign.organization?.admins && campaign.organization.admins.length > 0;
      const isBacker = campaign.contributions && campaign.contributions.length > 0;

      if (!isOrgAdmin && !isBacker) {
        return NextResponse.json(
          { error: "Forbidden: Only authorized organization admins or campaign backers can approve milestone fund releases." },
          { status: 403 }
        );
      }

      const actorRole = isOrgAdmin ? "admin" : "backer";

      // Release milestone funds from Escrow to creator
      const result = await approveAndReleaseMilestone({
        milestoneId,
        approverId: user.id,
        actorRole,
      });

      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: "Invalid action. Expected 'submit_proof' or 'approve_release'." }, { status: 400 });
  } catch (error: any) {
    console.error("Milestone action error:", error);
    return NextResponse.json({ error: error.message || "Failed to update milestone" }, { status: 400 });
  }
}
