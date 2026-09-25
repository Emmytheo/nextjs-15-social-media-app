import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> | { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    const follows = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        following: {
          select: getUserDataSelect(loggedInUser.id),
        },
      },
    });

    const users = follows.map((f) => f.following);

    return Response.json(users);
  } catch (error) {
    console.error("Error fetching following list:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
