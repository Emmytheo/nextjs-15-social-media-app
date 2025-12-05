import { validateRequest } from "@/auth";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ProgramStatus } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params: { organizationId } }: { params: { organizationId: string } },
) {
  try {
    const { user } = await validateRequest();
    // if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const cursor = request.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 10;

    const programs = await prisma.organizationProgram.findMany({
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
        events: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          }
        },
        activities: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          }
        },
        _count: {
          select: {
            events: true,
            activities: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = programs.length > pageSize ? programs[pageSize].id : null;

    const data = {
      programs: programs.slice(0, pageSize),
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

    if (!isAdmin) {
      return Response.json({ error: "Access denied: Only organization admins can create programs" }, { status: 403 });
    }

    const { title, description, category, startDate, endDate, status } = await request.json();

    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    // Validate and parse status
    const validStatus = status && Object.values(ProgramStatus).includes(status as ProgramStatus)
      ? (status as ProgramStatus)
      : ProgramStatus.DRAFT;

    const program = await prisma.organizationProgram.create({
      data: {
        title,
        description,
        category,
        organizationId,
        userId: user.id,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: validStatus,
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
        events: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          }
        },
        activities: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          }
        },
        _count: {
          select: {
            events: true,
            activities: true,
          },
        },
      },
    });

    return Response.json(program);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
