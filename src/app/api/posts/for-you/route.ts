import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 10;

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

    // 2. Get fellow members from these organizations
    const fellowMembers = await prisma.organizationMember.findMany({
      where: {
        organizationId: { in: orgIds },
        userId: { not: user.id }, // Exclude self
      },
      select: { userId: true },
      distinct: ["userId"], // Avoid duplicates
    });

    const fellowMemberIds = fellowMembers.map((m) => m.userId);

    // 3. Fetch posts from:
    // - Users I follow (existing logic usually handles this, but we'll be explicit if needed)
    // - Fellow organization members
    // - My own posts (optional, usually included)
    
    // Note: The original "For You" might have been just "all posts" or "following". 
    // Assuming "For You" here means "Personalized Discovery".
    // If it was "All Posts" (public feed), we are now filtering it to be more relevant.
    // Let's make it a mix of Following + Fellow Members.
    
    // However, the previous implementation was:
    // const posts = await prisma.post.findMany({...}) 
    // without a `where` clause on users, implying it was a global feed or the `where` was missing.
    // Looking at the previous code: `const posts = await prisma.post.findMany({ ... })` with NO where clause.
    // This means it was showing ALL posts from EVERYONE.
    
    // To make it "Smart", we should prioritize or filter. 
    // If the user wants "relevant" info, we should probably restrict it to:
    // Following OR Fellow Members.
    
    const posts = await prisma.post.findMany({
      where: {
        user: {
          id: {
            in: [...fellowMemberIds, user.id], // Add following logic if needed, but for now focusing on Org Members
          }
        }
      },
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
