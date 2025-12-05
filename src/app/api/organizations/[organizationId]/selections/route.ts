import { validateRequest } from "@/auth";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params: { organizationId } }: { params: { organizationId: string } },
) {
  try {
    const { user } = await validateRequest();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const cursor = request.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 10;

    const selections = await prisma.organizationSelection.findMany({
      where: { organizationId },
      include: {
        songs: {
          include: {
            song: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            songs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = selections.length > pageSize ? selections[pageSize].id : null;

    const data = {
      selections: selections.slice(0, pageSize),
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

    // Check if user is an admin of the organization
    const adminCheck = await prisma.organizationAdmin.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (!adminCheck) {
      return Response.json({ error: "Access denied. Admin privileges required." }, { status: 403 });
    }

    const { title, description, purpose, songs } = await request.json();

    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    if (!songs || !Array.isArray(songs) || songs.length === 0) {
      return Response.json({ error: "At least one song is required" }, { status: 400 });
    }

    const selection = await prisma.organizationSelection.create({
      data: {
        title,
        description,
        purpose,
        organizationId,
        userId: user.id,
        songs: {
          create: songs.map((songId: string, index: number) => ({
            songId,
            order: index + 1,
          })),
        },
      },
      include: {
        songs: {
          include: {
            song: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            songs: true,
          },
        },
      },
    });

    return Response.json(selection);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
