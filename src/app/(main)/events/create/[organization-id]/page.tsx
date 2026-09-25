import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { CreateEventForm } from "../CreateEventForm";

interface PageProps {
  params: Promise<{ "organization-id": string }> | { "organization-id": string };
}

const getOrganization = cache(
  async (organizationId: string, userId: string) => {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        admins: {
          where: { userId },
          select: { userId: true },
        },
      },
    });

    return organization;
  },
);

export default async function CreateEventPage({ params }: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const organizationId = resolvedParams["organization-id"];

  const organization = await getOrganization(organizationId, loggedInUser.id);

  if (!organization) {
    notFound();
  }

  // Check if user is an admin of this organization
  const isAdmin = organization.admins.length > 0;

  if (!isAdmin) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to create events for this organization.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <CreateEventForm
        organizationId={organizationId}
        organizationName={organization.name}
      />
    </div>
  );
}
