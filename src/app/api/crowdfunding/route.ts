import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { CampaignCategory, CampaignStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const organizationId = searchParams.get("organizationId");
    const status = searchParams.get("status");

    const where: any = {};
    if (category) where.category = category as CampaignCategory;
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status as CampaignStatus;

    const campaigns = await prisma.crowdfundingCampaign.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        milestones: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: { contributions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error("Fetch campaigns error:", error);
    return NextResponse.json({ error: error.message || "Failed to load campaigns" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      tagline,
      description,
      coverUrl,
      category = "COMMUNITY_PROJECT",
      targetAmount,
      deadline,
      organizationId,
      minPledge = 5.0,
      milestones = [],
    } = body;

    if (!title || !description || !targetAmount) {
      return NextResponse.json({ error: "Title, description, and target amount are required" }, { status: 400 });
    }

    const parsedTarget = Number(targetAmount);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      return NextResponse.json({ error: "Target amount must be greater than zero" }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    // Create campaign and milestones in transaction
    const newCampaign = await prisma.$transaction(async (tx) => {
      const campaign = await tx.crowdfundingCampaign.create({
        data: {
          slug: uniqueSlug,
          title,
          tagline,
          description,
          coverUrl: coverUrl || "/img/logo.png",
          category: category as CampaignCategory,
          targetAmount: parsedTarget,
          raisedAmount: 0.0,
          currency: "USD",
          deadline: deadline ? new Date(deadline) : null,
          status: CampaignStatus.ACTIVE,
          escrowEnabled: true,
          minPledge: Number(minPledge) || 5.0,
          creatorId: user.id,
          organizationId: organizationId || null,
        },
      });

      // Insert milestones if provided, or default to 2 standard milestones (50% / 50%)
      if (Array.isArray(milestones) && milestones.length > 0) {
        for (let i = 0; i < milestones.length; i++) {
          const m = milestones[i];
          await tx.campaignMilestone.create({
            data: {
              campaignId: campaign.id,
              title: m.title || `Phase ${i + 1}`,
              description: m.description || `Deliverable milestone ${i + 1}`,
              targetAmount: Number(m.targetAmount) || parsedTarget / milestones.length,
              percentage: Number(m.percentage) || 100 / milestones.length,
              order: i + 1,
            },
          });
        }
      } else {
        // Create 2 default milestones
        await tx.campaignMilestone.createMany({
          data: [
            {
              campaignId: campaign.id,
              title: "Phase 1: Project Kickoff & Setup",
              description: "Initial mobilization, raw materials, or service kickoff.",
              targetAmount: parsedTarget * 0.5,
              percentage: 50,
              order: 1,
            },
            {
              campaignId: campaign.id,
              title: "Phase 2: Final Delivery & Handover",
              description: "Final execution, project delivery, and community handover.",
              targetAmount: parsedTarget * 0.5,
              percentage: 50,
              order: 2,
            },
          ],
        });
      }

      return campaign;
    });

    return NextResponse.json({ success: true, campaign: newCampaign });
  } catch (error: any) {
    console.error("Create campaign error:", error);
    return NextResponse.json({ error: error.message || "Failed to create campaign" }, { status: 400 });
  }
}
