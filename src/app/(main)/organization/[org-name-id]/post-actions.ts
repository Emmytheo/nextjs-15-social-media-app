"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getOrganizationPostInclude } from "@/lib/types";

export async function submitOrganizationPost(input: {
  content: string;
  mediaIds: string[];
  organizationId: string;
}) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { content, mediaIds, organizationId } = input;

  if (!content) {
    throw new Error("Content is required");
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

  const newPost = await prisma.organizationPost.create({
    data: {
      content,
      organizationId,
      userId: user.id,
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: getOrganizationPostInclude(user.id),
  });

  return newPost;
}
