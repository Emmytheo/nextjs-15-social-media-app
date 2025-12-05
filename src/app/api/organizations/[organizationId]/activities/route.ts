import { validateRequest } from "@/auth";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params: { organizationId } }: { params: { organizationId: string } },
) {
  try {
    const { user } = await validateRequest();
    // if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const cursor = request.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 10;

    const activities = await prisma.organizationActivity.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              }
            }
          }
        },
        _count: {
          select: {
            participants: true,
          },
        },
        organizationProgram: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = activities.length > pageSize ? activities[pageSize].id : null;

    const data = {
      activities: activities.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params: { organizationId } }: { params: { organizationId: string } },
) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or member
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        admins: {
          where: { userId: user.id },
        },
        members: {
          where: { userId: user.id },
        },
      },
    });

    if (!organization) {
      return Response.json({ error: "Organization not found" }, { status: 404 });
    }

    const isMember = organization.members.length > 0;
    const isAdmin = organization.admins.length > 0;

    if (!isMember) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    const { title, description, type, startDate, endDate, location, capacity, organizationProgramId } = await request.json();

    if (!title || !type || !startDate) {
      return Response.json({ error: "Title, type, and startDate are required" }, { status: 400 });
    }

    const activity = await prisma.organizationActivity.create({
      data: {
        title,
        description,
        type,
        organizationId,
        userId: user.id,
        startDate: new Date(startDate),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(location && { location }),
        ...(capacity && { capacity: parseInt(capacity.toString()) }),
        ...(organizationProgramId && { organizationProgramId }),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              }
            }
          }
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return Response.json(activity);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
