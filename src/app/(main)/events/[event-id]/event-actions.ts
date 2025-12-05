"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

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

  return activity;
}
