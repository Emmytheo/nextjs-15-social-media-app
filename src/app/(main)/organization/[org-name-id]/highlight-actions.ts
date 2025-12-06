"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { OrganizationHighlightData, getOrganizationHighlightInclude } from "@/lib/types";

export async function createOrganizationHighlight(organizationId: string, input: {
  title: string;
  content: string;
  excerpt?: string;
  type?: "ARTICLE" | "STORY" | "MEMBER_MENTION" | "ANNOUNCEMENT" | "NEWS";
  category?: string;
  featured?: boolean;
  attachments?: { type: string; url: string }[];
  activityId?: string;
  programId?: string;
}): Promise<OrganizationHighlightData> {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { title, content, excerpt, type, category, featured, attachments, activityId, programId } = input;

  if (!title || !content) {
    throw new Error("Title and content are required");
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

  const highlight = await prisma.organizationHighlight.create({
    data: {
      title,
      content,
      excerpt,
      type: type || "ARTICLE",
      category,
      featured: featured || false,
      organizationId,
      userId: user.id,
      activityId,
      programId,
      attachments: {
        create: attachments?.map((attachment) => ({
          type: attachment.type as "IMAGE" | "VIDEO",
          url: attachment.url,
        })) || [],
      },
    },
    include: getOrganizationHighlightInclude(user.id),
  });

  return highlight;
}

export async function updateOrganizationHighlight(
  highlightId: string,
  input: {
    title: string;
    content: string;
    excerpt?: string;
    type?: "ARTICLE" | "STORY" | "MEMBER_MENTION" | "ANNOUNCEMENT" | "NEWS";
    category?: string;
    featured?: boolean;
    attachments?: { type: string; url: string }[];
    activityId?: string;
    programId?: string;
  }
) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const highlight = await prisma.organizationHighlight.findUnique({
    where: { id: highlightId },
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

  if (!highlight) throw new Error("Highlight not found");

  const isAdmin = highlight.organization.admins.length > 0;

  if (!isAdmin) throw new Error("Access denied");

  const { title, content, excerpt, type, category, featured, attachments, activityId, programId } = input;

  const updatedHighlight = await prisma.organizationHighlight.update({
    where: { id: highlightId },
    data: {
      title,
      content,
      excerpt,
      type,
      category,
      featured,
      activityId,
      programId,
    //   attachments: {
    //     deleteMany: {},
    //     create: attachments?.map((attachment) => ({
    //       type: attachment.type as "IMAGE" | "VIDEO",
    //       url: attachment.url,
    //     })) || [],
    //   },
    },
    include: getOrganizationHighlightInclude(user.id),
  });

  return updatedHighlight;
}
