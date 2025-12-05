"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { OrganizationSelectionData, getOrganizationSelectionInclude } from "@/lib/types";

export async function createOrganizationSelection(organizationId: string, input: {
  title: string;
  description?: string;
  purpose?: string;
}): Promise<OrganizationSelectionData> {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { title, description, purpose } = input;

  if (!title) {
    throw new Error("Title is required");
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

  const selection = await prisma.organizationSelection.create({
    data: {
      title,
      description,
      purpose,
      organizationId,
      userId: user.id,
    },
    include: getOrganizationSelectionInclude(user.id),
  });

  return selection;
}
