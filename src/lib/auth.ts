// This file is unused/legacy and caused compilation errors due to missing next-auth dependency.
// Keeping it as a placeholder to avoid breaking potential obscure imports, but content is commented out.

/*
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    }
  }
}

export async function getServerSession() {
  const { getServerSession } = await import("next-auth")
  return getServerSession(authOptions)
}
*/
