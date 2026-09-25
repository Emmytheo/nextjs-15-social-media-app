import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EventStatus } from "@prisma/client";

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, "Start date must be a valid date and time"),
  endDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === "") return true;
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, "End date must be a valid date and time"),
  location: z.string().optional(),
  venue: z.string().optional(),
  address: z.string().optional(),
  ticketType: z.enum(["FREE", "PAID", "DONATION"]),
  ticketPrice: z.coerce.number().optional(),
  ticketUrl: z.string().url().optional().or(z.literal("")),
  coverPhotoUrl: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  programmeOverview: z.string().optional(),
  organizationId: z.string(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title");
  const search = searchParams.get("search");
  const statusParam = searchParams.get("status");
  const isPublishedParam = searchParams.get("isPublished");
  const category = searchParams.get("category");
  const organizationId = searchParams.get("organizationId");
  const scope = searchParams.get("scope"); // "all" | "my-guilds" | "attending" | "hosted"
  const timeframe = searchParams.get("timeframe"); // "all" | "upcoming" | "this-week" | "this-month" | "past"
  const ticketType = searchParams.get("ticketType"); // "ALL" | "FREE" | "PAID" | "DONATION"

  // Validate and parse status
  const status =
    statusParam &&
    Object.values(EventStatus).includes(statusParam as EventStatus)
      ? (statusParam as EventStatus)
      : undefined;

  // Parse isPublished as boolean
  const isPublished = isPublishedParam
    ? isPublishedParam === "true"
    : undefined;

  try {
    const { user: loggedInUser } = await validateRequest();

    const now = new Date();
    const nowPlus7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nowPlus30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Build timeframe condition
    let dateFilter: any = undefined;
    if (timeframe === "upcoming") {
      dateFilter = { gte: now };
    } else if (timeframe === "this-week") {
      dateFilter = { gte: now, lte: nowPlus7Days };
    } else if (timeframe === "this-month") {
      dateFilter = { gte: now, lte: nowPlus30Days };
    } else if (timeframe === "past") {
      dateFilter = { lt: now };
    }

    // Build scope condition
    let scopeWhere: any = {};
    if (scope === "my-guilds") {
      if (!loggedInUser) {
        return NextResponse.json([]);
      }
      scopeWhere = {
        organization: {
          OR: [
            { members: { some: { userId: loggedInUser.id } } },
            { admins: { some: { userId: loggedInUser.id } } },
          ],
        },
      };
    } else if (scope === "attending") {
      if (!loggedInUser) {
        return NextResponse.json([]);
      }
      scopeWhere = {
        attendees: {
          some: { userId: loggedInUser.id },
        },
      };
    } else if (scope === "hosted") {
      if (!loggedInUser) {
        return NextResponse.json([]);
      }
      scopeWhere = {
        organization: {
          admins: { some: { userId: loggedInUser.id } },
        },
      };
    }

    // Search query filter
    const searchFilter = search ? {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { venue: { contains: search, mode: "insensitive" as const } },
        { location: { contains: search, mode: "insensitive" as const } },
        { organization: { name: { contains: search, mode: "insensitive" as const } } },
      ]
    } : {};

    // Category filter
    const categoryFilter = category && category !== "ALL" ? {
      category: { contains: category, mode: "insensitive" as const }
    } : {};

    // Ticket filter
    const ticketFilter = ticketType && ticketType !== "ALL" ? {
      ticketType: ticketType as any
    } : {};

    // For general public, default to published events unless specifically asking for draft / hosted
    const publishedFilter = isPublished !== undefined 
      ? { isPublished } 
      : (scope === "hosted" ? {} : { isPublished: true });

    const events = await prisma.event.findMany({
      where: {
        ...(title && { title }),
        ...(status && { status }),
        ...publishedFilter,
        ...(organizationId && { organizationId }),
        ...(dateFilter && { startDate: dateFilter }),
        ...scopeWhere,
        ...searchFilter,
        ...categoryFilter,
        ...ticketFilter,
      },
      include: {
        attendees: {
          select: {
            id: true,
            userId: true,
            status: true,
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            bannerUrl: true,
          },
        },
      },
      orderBy: {
        startDate: timeframe === "past" ? "desc" : "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { organizationId, ...eventData } = validation.data;

    // Check if user is admin of the organization
    const orgMembership = await prisma.organizationAdmin.findUnique({
      where: {
        userId_organizationId: {
          userId: loggedInUser.id,
          organizationId: organizationId,
        },
      },
    });

    if (!orgMembership) {
      return NextResponse.json(
        {
          error:
            "You don't have permission to create events for this organization. Admin access required.",
        },
        { status: 403 },
      );
    }

    const event = await prisma.event.create({
      data: {
        ...eventData,
        coverPhotoUrl: eventData.coverPhotoUrl || null,
        logoUrl: eventData.logoUrl || null,
        startDate: new Date(eventData.startDate),
        endDate: eventData.endDate ? new Date(eventData.endDate) : null,
        organizationId: organizationId,
        status: "PUBLISHED",
        isPublished: true,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
