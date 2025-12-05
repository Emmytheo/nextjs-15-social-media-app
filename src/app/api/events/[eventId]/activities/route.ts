import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import { createEventActivity } from "@/app/(main)/events/[event-id]/event-actions";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = 10;

    const activities = await prisma.eventActivity.findMany({
      where: {
        eventId: params.eventId,
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
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });

    const hasNextPage = activities.length > limit;
    const nextCursor = hasNextPage ? activities[limit - 1].id : null;

    const data = {
      activities: hasNextPage ? activities.slice(0, limit) : activities,
      nextCursor,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching event activities:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const body = await req.json();
    const activity = await createEventActivity(params.eventId, body);
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Error creating event activity:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
