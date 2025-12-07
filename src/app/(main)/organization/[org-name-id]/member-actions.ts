"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function inviteMemberToOrganization(organizationId: string, email: string, role?: string): Promise<{ success: boolean; message: string }> {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("Unauthorized");
  }

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

  const { admins } = organization;

  if (!admins.length) {
    throw new Error("Access denied: Only organization admins can invite members");
  }

  if (!email || !email.includes("@")) {
    throw new Error("Invalid email address");
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    // Check if user is already a member
    const existingMembership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: existingUser.id,
          organizationId,
        },
      },
    });

    if (existingMembership) {
      throw new Error("User is already a member of this organization");
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.notification.findFirst({
      where: {
        recipientId: existingUser.id,
        issuerId: user.id,
        type: "ORGANIZATION_INVITE",
        organizationId,
      },
    });

    if (existingInvitation) {
      throw new Error("Invitation already sent to this user");
    }

    // Create invitation notification
    await prisma.notification.create({
      data: {
        recipient: { connect: { id: existingUser.id } },
        issuer: { connect: { id: user.id } },
        type: "ORGANIZATION_INVITE",
        organization: { connect: { id: organizationId } },
        read: false,
      },
    });

    return { success: true, message: "Invitation sent successfully" };
  } else {
    // User doesn't exist, could send email invitation in the future
    // For now, just return that user needs to register first
    return { success: false, message: "User not found. User must register to the platform first before being invited." };
  }
}

export async function removeMemberFromOrganization(organizationId: string, memberUserId: string): Promise<{ success: boolean; message: string }> {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if current user is admin
  const adminCheck = await prisma.organizationAdmin.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId,
      },
    },
  });

  if (!adminCheck) {
    throw new Error("Access denied: Only organization admins can remove members");
  }

  // Cannot remove yourself as admin
  if (memberUserId === user.id) {
    throw new Error("Cannot remove yourself from the organization");
  }

  // Check if member exists
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: memberUserId,
        organizationId,
      },
    },
  });

  if (!membership) {
    throw new Error("User is not a member of this organization");
  }

  // Remove member
  await prisma.organizationMember.delete({
    where: {
      userId_organizationId: {
        userId: memberUserId,
        organizationId,
      },
    },
  });

  return { success: true, message: "Member removed successfully" };
}

export async function acceptOrganizationInvitation(notificationId: string): Promise<{ success: boolean; message: string }> {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Find the notification
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.type !== "ORGANIZATION_INVITE") {
    throw new Error("Invalid invitation");
  }

  if (notification.recipientId !== user.id) {
    throw new Error("Unauthorized to accept this invitation");
  }

  // Ensure organizationId is available on the type
  const organizationId = notification.organizationId;

  if (!organizationId) {
    throw new Error("Invalid invitation: No organization ID");
  }

  // Check if already a member
  const existingMembership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId,
      },
    },
  });

  if (existingMembership) {
    // Mark notification as read
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
    return { success: true, message: "Already a member of this organization" };
  }

  // Add to organization
  await prisma.organizationMember.create({
    data: {
      userId: user.id,
      organizationId,
      joinedAt: new Date(),
    },
  });


  // Mark notification as read
  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  // Update OrganizationInvitation status if it exists
  // organizationInvitation exists in schema and types should be correct now
  await prisma.organizationInvitation.updateMany({
      where: {
          organizationId,
          email: user.email!,
          status: "PENDING"
      },
      data: {
          status: "ACCEPTED",
          acceptedAt: new Date()
      }
  });

  return { success: true, message: "Successfully joined the organization" };
}

export async function getPendingInvitation(organizationId: string) {
  const { user } = await validateRequest();

  if (!user) return null;

  const notification = await prisma.notification.findFirst({
    where: {
      recipientId: user.id,
      organizationId,
      type: "ORGANIZATION_INVITE",
      read: false,
    },
    select: {
      id: true,
    },
  });

  return notification;
}

