"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { MediaType } from "@prisma/client";

export async function createOrganizationGalleryItem(organizationId: string, input: {
  title?: string;
  caption?: string;
  type: MediaType;
  url: string;
  tags?: string[];
  activityId?: string;
  programId?: string;
  highlightId?: string;
}) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { title, caption, type, url, tags, activityId, programId, highlightId } = input;

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
  
  if (!isMember) {
    throw new Error("Access denied");
  }

  const galleryItem = await prisma.organizationGallery.create({
    data: {
      title,
      caption,
      type,
      url,
      tags: tags || [],
      organizationId,
      userId: user.id,
      activityId,
      programId,
      highlightId,
    },
    include: {
        user: {
            select: {
                displayName: true,
                avatarUrl: true,
            }
        }
    }
  });

  return galleryItem;
}
