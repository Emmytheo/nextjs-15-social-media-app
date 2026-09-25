import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;

    const galleryItems = await prisma.eventGallery.findMany({
      where: {
        eventId,
      },
      include: {
        media: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ galleryItems });
  } catch (error) {
    console.error("Error fetching event gallery:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;
    const body = await req.json();
    const { url, type = "IMAGE", caption } = body;

    if (!url) {
      return NextResponse.json({ error: "Media URL is required" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organization: {
          include: {
            admins: { where: { userId: user.id } },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organization.admins.length === 0) {
      return NextResponse.json(
        { error: "Forbidden: Only organization admins can add photos to the event gallery" },
        { status: 403 }
      );
    }

    const media = await prisma.media.create({
      data: {
        url,
        type: type === "VIDEO" ? "VIDEO" : "IMAGE",
      },
    });

    const galleryItem = await prisma.eventGallery.create({
      data: {
        eventId,
        mediaId: media.id,
        caption: caption || null,
      },
      include: {
        media: true,
      },
    });

    return NextResponse.json(galleryItem, { status: 201 });
  } catch (error) {
    console.error("Error creating event gallery item:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
