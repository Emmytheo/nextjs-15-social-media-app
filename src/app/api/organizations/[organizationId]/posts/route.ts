import { validateRequest } from "@/auth";
import { NextRequest } from "next/server";
import { OrganizationPostsPage, getOrganizationPostInclude } from "@/lib/types";
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

    const posts = await prisma.organizationPost.findMany({
      where: { organizationId },
      include: getOrganizationPostInclude(user?.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: OrganizationPostsPage = {
      posts: posts.slice(0, pageSize),
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

    const { content, attachments } = await request.json();

    if (!content) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }

    const post = await prisma.organizationPost.create({
      data: {
        content,
        organizationId,
        userId: user.id,
        attachments: {
          create: attachments?.map((attachment: any) => ({
            type: attachment.type,
            url: attachment.url,
          })) || [],
        },
      },
      include: getOrganizationPostInclude(user.id),
    });

    return Response.json(post);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
