"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createEventActivity(
  eventId: string,
  input: {
    title: string;
    description?: string;
    startTime: Date;
    endTime?: Date;
    location?: string;
    category?: string;
  }
) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { title, description, startTime, endTime, location, category } = input;

  if (!title) {
    throw new Error("Title is required");
  }

  // Check if the event exists and if the user is an admin of the organization
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organization: {
        include: {
          admins: {
            where: { userId: user.id },
          },
        },
      },
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  const isAdmin = event.organization.admins.length > 0;

  if (!isAdmin) {
    throw new Error("Access denied");
  }

  const activity = await prisma.eventActivity.create({
    data: {
      eventId,
      userId: user.id,
      title,
      description: description ?? null,
      startTime,
      endTime: endTime ?? null,
      location: location ?? null,
    },
  });

  revalidatePath(`/events/${eventId}`);
  return activity;
}

export async function rsvpToEvent(eventId: string): Promise<{ success: boolean; message: string }> {
  const { user } = await validateRequest();

  if (!user) {
    return { success: false, message: "You must be signed in to RSVP" };
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    return { success: false, message: "Event not found" };
  }

  const existingAttendee = await prisma.eventAttendee.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId: user.id,
      },
    },
  });

  if (existingAttendee) {
    return { success: true, message: "You are already registered for this event" };
  }

  await prisma.eventAttendee.create({
    data: {
      eventId,
      userId: user.id,
      status: "CONFIRMED",
      ticketCode: `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    },
  });

  revalidatePath(`/events/${eventId}`);
  return { success: true, message: "Successfully registered for this event!" };
}

export async function cancelEventRsvp(eventId: string): Promise<{ success: boolean; message: string }> {
  const { user } = await validateRequest();

  if (!user) {
    return { success: false, message: "You must be signed in" };
  }

  const existingAttendee = await prisma.eventAttendee.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId: user.id,
      },
    },
  });

  if (!existingAttendee) {
    return { success: false, message: "You are not registered for this event" };
  }

  await prisma.eventAttendee.delete({
    where: {
      eventId_userId: {
        eventId,
        userId: user.id,
      },
    },
  });

  revalidatePath(`/events/${eventId}`);
  return { success: true, message: "Registration cancelled" };
}
