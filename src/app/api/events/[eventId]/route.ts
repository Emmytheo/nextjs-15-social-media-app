import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EventStatus } from "@prisma/client";

const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  startDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return !isNaN(new Date(val).getTime());
    }, "Invalid start date"),
  endDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === "") return true;
      return !isNaN(new Date(val).getTime());
    }, "Invalid end date"),
  location: z.string().optional(),
  venue: z.string().optional(),
  address: z.string().optional(),
  ticketType: z.enum(["FREE", "PAID", "DONATION"]).optional(),
  ticketPrice: z.coerce.number().optional(),
  ticketUrl: z.string().url().optional().or(z.literal("")),
  coverPhotoUrl: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  programmeOverview: z.string().optional(),
  status: z.nativeEnum(EventStatus).optional(),
  isPublished: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { eventId } = await params;
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organization: {
        select: { id: true, name: true, logoUrl: true },
      },
      _count: {
        select: { attendees: true, activities: true, gallery: true },
      },
      attendees: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              email: true,
            },
          },
        },
        orderBy: { registeredAt: "desc" },
      },
      activities: {
        orderBy: { startTime: "asc" },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { eventId } = await params;
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organization: {
        include: {
          admins: { where: { userId: user.id } },
          members: { where: { userId: user.id } },
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const isAdmin = event.organization.admins.length > 0;

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Forbidden: Only organization admins can update event details" },
      { status: 403 },
    );
  }

  const body = await req.json();
  const validation = updateEventSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid data", details: validation.error.issues },
      { status: 400 },
    );
  }

  const { startDate, endDate, ...rest } = validation.data;

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...rest,
      ...(rest.coverPhotoUrl !== undefined && { coverPhotoUrl: rest.coverPhotoUrl || null }),
      ...(rest.logoUrl !== undefined && { logoUrl: rest.logoUrl || null }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
    },
    include: {
      organization: { select: { id: true, name: true } },
      _count: { select: { attendees: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { eventId } = await params;
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organization: {
        include: { admins: { where: { userId: user.id } } },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.organization.admins.length === 0) {
    return NextResponse.json(
      { error: "Only organization admins can delete events" },
      { status: 403 },
    );
  }

  await prisma.event.delete({ where: { id: eventId } });

  return NextResponse.json({ success: true });
}
