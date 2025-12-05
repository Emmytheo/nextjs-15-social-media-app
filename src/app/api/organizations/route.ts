import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await validateRequest();
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizations = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            // userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        admins: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(organizations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 },
    );
  }
}

async function GETOrganizationPosts(
  request: Request,
  { params }: { params: { orgId: string } },
) {
  try {
    const session = await validateRequest();
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const pageSize = 10;

    const posts = await prisma.organizationPost.findMany({
      where: { organizationId: params.orgId },
      include: {
        organization: true,
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
        attachments: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          where: {
            userId: session.user.id,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = posts.length > pageSize ? posts.pop()?.id : null;

    return NextResponse.json({
      posts,
      nextCursor,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch organization posts" },
      { status: 500 },
    );
  }
}

async function GETOrganizationMembers(
  request: Request,
  { params }: { params: { orgId: string } },
) {
  try {
    const session = await validateRequest();
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: params.orgId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch organization members" },
      { status: 500 },
    );
  }
}

async function POSTOrganizationPost(
  request: Request,
  { params }: { params: { orgId: string } },
) {
  try {
    const session = await validateRequest();
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Post content is required" },
        { status: 400 },
      );
    }

    const post = await prisma.organizationPost.create({
      data: {
        content,
        organizationId: params.orgId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create organization post" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await validateRequest();
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 },
      );
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: session.user.id,
          },
        },
        admins: {
          create: {
            userId: session.user.id,
          },
        },
      },
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 },
    );
  }
}
