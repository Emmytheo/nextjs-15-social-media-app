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
  programmeOverview: z.string().optional(),
  organizationId: z.string(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title"); // Note: using 'name' param but mapping to 'title' field
  const statusParam = searchParams.get("status");
  const isPublishedParam = searchParams.get("isPublished");
  const category = searchParams.get("category");
  const organizationId = searchParams.get("organizationId");

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

    if (!loggedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: {
        ...(title && { title }),
        ...(status && { status }),
        ...(isPublished !== undefined && { isPublished }),
        ...(category && { category }),
        ...(organizationId && { organizationId }),
      },
      include: {
        attendees: {
          select:{
            user: true,
            id: true,
            userId: true,
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });
    // console.log("Here", {
    //   organizationId,
    //   category,
    //   isPublishedParam,
    //   statusParam,
    //   title,
    // });
    
    return NextResponse.json(events);
  } catch (error) {
    // console.error("Error fetching events:", error);
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

    const isSuperAdmin = true; // For testing - in production, check admin role

    if (!orgMembership && !isSuperAdmin) {
      return NextResponse.json(
        {
          error:
            "You don't have permission to create events for this organization",
        },
        { status: 403 },
      );
    }

    const event = await prisma.event.create({
      data: {
        ...eventData,
        startDate: new Date(eventData.startDate),
        endDate: eventData.endDate ? new Date(eventData.endDate) : null,
        organizationId: organizationId,
        status: "DRAFT",
        isPublished: false,
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
