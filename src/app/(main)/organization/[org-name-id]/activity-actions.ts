"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { OrganizationActivityData, getOrganizationActivityInclude } from "@/lib/types";

export async function createOrganizationActivity(organizationId: string, input: {
  title: string;
  description?: string;
  type: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  capacity?: number;
  organizationProgramId?: string;
}): Promise<OrganizationActivityData> {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { title, description, type, startDate, endDate, location, capacity, organizationProgramId } = input;

  if (!title || !type) {
    throw new Error("Title and type are required");
  }

  // Check if user is admin or member
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      admins: {
        where: { userId: user.id },
      },
      members: {
        where: { userId: user.id },
      },
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const isMember = organization.members.length > 0;
  const isAdmin = organization.admins.length > 0;

  if (!isMember) {
    throw new Error("Access denied");
  }

  const activity = await prisma.organizationActivity.create({
    data: {
      title,
      description,
      type,
      organizationId,
      userId: user.id,
      startDate,
      endDate: endDate ?? null,
      location,
      capacity,
      organizationProgramId,
    },
  });

  // Fetch the created activity with includes
  const createdActivity = await prisma.organizationActivity.findUnique({
    where: { id: activity.id },
    include: getOrganizationActivityInclude(user.id),
  });

  if (!createdActivity) {
    throw new Error("Failed to retrieve created activity");
  }

  return createdActivity;
}

export async function updateOrganizationActivity(
  activityId: string,
  input: {
    title: string;
    description?: string;
    type: string;
    startDate: Date;
    endDate?: Date;
    location?: string;
    capacity?: number;
    organizationProgramId?: string;
  }
) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const activity = await prisma.organizationActivity.findUnique({
    where: { id: activityId },
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

  if (!activity) throw new Error("Activity not found");

  const isAdmin = activity.organization.admins.length > 0;

  if (!isAdmin) throw new Error("Access denied");

  const updatedActivity = await prisma.organizationActivity.update({
    where: { id: activityId },
    data: {
      ...input,
      endDate: input.endDate ?? null,
    },
    include: getOrganizationActivityInclude(user.id),
  });

  return updatedActivity;
}
