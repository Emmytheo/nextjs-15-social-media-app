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

    const highlights = await prisma.organizationHighlight.findMany({
      where: { organizationId, published: true },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        likes: {
          where: {
            userId: user?.id ?? "",
          },
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
        activity: {
          select: {
            id: true,
            title: true,
          },
        },
        program: {
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

    const nextCursor = highlights.length > pageSize ? highlights[pageSize].id : null;

    const data = {
      highlights: highlights.slice(0, pageSize),
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

    const { title, content, type, category, excerpt, featured, attachments } = await request.json();

    if (!title || !content) {
      return Response.json({ error: "Title and content are required" }, { status: 400 });
    }

    const highlight = await prisma.organizationHighlight.create({
      data: {
        title,
        content,
        type: type || "NEWS",
        category,
        excerpt,
        featured: featured || false,
        organizationId,
        userId: user.id,
        attachments: {
          create: attachments?.map((attachment: any) => ({
            type: attachment.type,
            url: attachment.url,
          })) || [],
        },
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
        likes: {
          where: {
            userId: user.id,
          },
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return Response.json(highlight);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
