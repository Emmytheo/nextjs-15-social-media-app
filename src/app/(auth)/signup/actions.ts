"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signUp(
  credentials: SignUpValues,
): Promise<{ error: string }> {
  try {
    const { username, email, password, invitationCode } = signUpSchema.parse(credentials);


    // Validate invitation code
    const validCodes = process.env.INVITATION_CODES?.split(',').map(code => code.trim()) || [];
    
    let organizationIdToJoin: string | null = null;
    let organizationRole: string = "MEMBER";

    // Check if it's a global invite code
    if (!validCodes.includes(invitationCode)) {
      // Check if it's an organization invite code
      const organization = await prisma.organization.findFirst({
        // @ts-expect-error inviteCode exists in schema but types are stale
        where: { inviteCode: invitationCode },
        select: { id: true }
      });

      if (organization) {
        organizationIdToJoin = organization.id;
      } else {
         // Also check for pending OrganizationInvitation tokens if we want to support direct link-like codes
         // For now, based on requirements, just checking Org inviteCode
         return { error: "Invalid invitation code. Please contact an administrator for access." };
      }
    }

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUsername) {
      return {
        error: "Username already taken",
      };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return {
        error: "Email already taken",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: username,
          email,
          passwordHash,
        },
      });
      
      await streamServerClient.upsertUser({
        id: userId,
        username,
        name: username,
      });

      // If signed up with organization code, add to organization
      if (organizationIdToJoin) {
        await tx.organizationMember.create({
          data: {
             userId,
             organizationId: organizationIdToJoin,
          }
        });
      }
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}
