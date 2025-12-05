import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const { user } = await validateRequest();

  if (!user) {
    // return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const galleryItems = await prisma.organizationGallery.findMany({
    where: { organizationId },
    include: {
      user: {
        select: {
          displayName: true,
          avatarUrl: true,
        },
      },
      activity: {
        select: { title: true },
      },
      program: {
        select: { title: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ galleryItems });
}
