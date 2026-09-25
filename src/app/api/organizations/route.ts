import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await validateRequest();
    const currentUserId = session.user?.id;

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope"); // "all" | "my-guilds" | "managed"

    let whereClause: any = {};
    if (scope === "my-guilds") {
      if (!currentUserId) return NextResponse.json([]);
      whereClause = {
        OR: [
          { members: { some: { userId: currentUserId } } },
          { admins: { some: { userId: currentUserId } } },
        ],
      };
    } else if (scope === "managed") {
      if (!currentUserId) return NextResponse.json([]);
      whereClause = {
        admins: { some: { userId: currentUserId } },
      };
    }

    const organizations = await prisma.organization.findMany({
      where: whereClause,
      include: {
        members: {
          select: {
            userId: true,
          },
        },
        admins: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            members: true,
            events: true,
            programs: true,
            posts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = organizations.map((org) => {
      const isAdmin = currentUserId ? org.admins.some((a) => a.userId === currentUserId) : false;
      const isMember = currentUserId ? org.members.some((m) => m.userId === currentUserId) : false;
      return {
        id: org.id,
        name: org.name,
        description: org.description,
        logoUrl: org.logoUrl,
        bannerUrl: org.bannerUrl,
        inviteCode: org.inviteCode,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        isAdmin,
        isMember: isMember || isAdmin,
        userRole: isAdmin ? "ADMIN" : isMember ? "MEMBER" : null,
        _count: org._count,
        memberCount: org._count.members,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Failed to fetch organizations:", error);
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
    const { name, description, logo, banner } = body;

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
        logoUrl: logo || null,
        bannerUrl: banner || null,
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

export async function PATCH(request: Request) {
  try {
    const session = await validateRequest();
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, logo, banner } = body;

    if (!id) {
        return NextResponse.json(
            { error: "Organization ID is required" },
            { status: 400 },
        );
    }

    const organization = await prisma.organization.findUnique({
        where: { id },
        include: {
            admins: true,
        },
    });

    if (!organization) {
        return NextResponse.json(
            { error: "Organization not found" },
            { status: 404 },
        );
    }

    const isAdmin = organization.admins.some(
        (admin) => admin.userId === session.user.id
    );

    if (!isAdmin) {
        return NextResponse.json(
            { error: "You do not have permission to edit this organization" },
            { status: 403 },
        );
    }

    const updatedOrganization = await prisma.organization.update({
        where: { id },
        data: {
            name,
            description,
            logoUrl: logo,
            bannerUrl: banner,
        },
    });

    return NextResponse.json(updatedOrganization);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 },
    );
  }
}
