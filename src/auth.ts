import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Google } from "arctic";
import { Lucia, Session, User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import prisma from "./lib/prisma";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes(databaseUserAttributes) {
    return {
      id: databaseUserAttributes.id,
      username: databaseUserAttributes.username,
      displayName: databaseUserAttributes.displayName,
      avatarUrl: databaseUserAttributes.avatarUrl,
      googleId: databaseUserAttributes.googleId,
      email: databaseUserAttributes.email || null,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  googleId: string | null;
  email: string | null;
}

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`,
);

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value ?? null;

    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    // Import retry utility
    const { withDatabaseRetry } = await import("./lib/retry");

    try {
      // Validate session with retry logic and timeout protection
      const result = await Promise.race([
        withDatabaseRetry(
          async () => await lucia.validateSession(sessionId),
          3 // Max 3 retry attempts
        ),
        // 10 second timeout to prevent hanging requests
        new Promise<{ user: null; session: null }>((_, reject) =>
          setTimeout(
            () => reject(new Error("Session validation timeout")),
            30000
          )
        ),
      ]);

      // Update session cookie if fresh
      try {
        if (result.session && result.session.fresh) {
          const sessionCookie = lucia.createSessionCookie(result.session.id);
          (await cookies()).set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
          );
        }
        if (!result.session) {
          const sessionCookie = lucia.createBlankSessionCookie();
          (await cookies()).set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
          );
        }
      } catch (cookieError) {
        // Cookie operations can fail in some edge cases
        // Log but don't fail the entire validation
        console.warn("[Auth] Cookie update failed:", cookieError);
      }

      return result;
    } catch (error) {
      // Log validation errors with context
      console.error(
        "[Auth] Session validation failed after retries:",
        error instanceof Error ? error.message : error
      );

      // Return null session on any error
      // This forces re-authentication rather than leaving user in limbo
      try {
        const sessionCookie = lucia.createBlankSessionCookie();
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      } catch {
        // Silently fail cookie clearing if it errors
      }

      return {
        user: null,
        session: null,
      };
    }
  }
);
