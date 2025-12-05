import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getOrganizationHighlightInclude, OrganizationHighlightsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 5;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get user's organizations
    const userOrgs = await prisma.organizationMember.findMany({
      where: { userId: user.id },
      select: { organizationId: true },
    });

    const orgIds = userOrgs.map((org) => org.organizationId);

    if (orgIds.length === 0) {
        return Response.json({ highlights: [], nextCursor: null });
    }

    // 2. Fetch highlights from these organizations
    const highlights = await prisma.organizationHighlight.findMany({
      where: {
        organizationId: { in: orgIds },
        published: true,
      },
      include: getOrganizationHighlightInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = highlights.length > pageSize ? highlights[pageSize].id : null;

    const data: OrganizationHighlightsPage = {
      highlights: highlights.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
