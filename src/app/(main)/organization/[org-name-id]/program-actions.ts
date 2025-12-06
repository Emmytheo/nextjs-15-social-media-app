"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { ProgramStatus } from "@prisma/client";
import { OrganizationProgramData, getOrganizationProgramInclude } from "@/lib/types";

export async function createOrganizationProgram(organizationId: string, input: {
  title: string;
  description?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ProgramStatus;
}): Promise<OrganizationProgramData> {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { title, description, category, startDate, endDate, status } = input;

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

  if (!isAdmin) {
    throw new Error("Access denied: Only organization admins can create programs");
  }

  const program = await prisma.organizationProgram.create({
    data: {
      title,
      description,
      category,
      organizationId,
      userId: user.id,
      startDate,
      endDate,
      status: status || ProgramStatus.DRAFT,
    },
  });

  // Fetch the created program with includes
  const createdProgram = await prisma.organizationProgram.findUnique({
    where: { id: program.id },
    include: getOrganizationProgramInclude(user.id),
  });

  if (!createdProgram) {
    throw new Error("Failed to retrieve created program");
  }

  return createdProgram;
}

export async function updateOrganizationProgram(
  programId: string,
  input: {
    title: string;
    description?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
    status?: ProgramStatus;
  }
) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const program = await prisma.organizationProgram.findUnique({
    where: { id: programId },
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

  if (!program) throw new Error("Program not found");

  const isAdmin = program.organization.admins.length > 0;

  if (!isAdmin) throw new Error("Access denied");

  const updatedProgram = await prisma.organizationProgram.update({
    where: { id: programId },
    data: {
        ...input
    },
    include: getOrganizationProgramInclude(user.id),
  });

  return updatedProgram;
}
