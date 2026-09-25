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
        followingId: userId,
      },
      select: {
        follower: {
          select: getUserDataSelect(loggedInUser.id),
        },
      },
    });

    const users = follows.map((f) => f.follower);

    return Response.json(users);
  } catch (error) {
    console.error("Error fetching followers list:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
