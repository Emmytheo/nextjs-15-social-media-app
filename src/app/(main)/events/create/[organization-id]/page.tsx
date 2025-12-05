import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CreateEventForm } from "../CreateEventForm";

interface PageProps {
  params: { "organization-id": string };
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

export default async function CreateEventPage({
  params: { "organization-id": organizationId },
}: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return <div>You must be logged in to create an event.</div>;
  }

  const organization = await getOrganization(organizationId, loggedInUser.id);

  if (!organization) {
    notFound();
  }

  // Check if user is an admin of this organization
  const isAdmin = organization.admins.length > 0;
  const isSuperAdmin = true; // For testing

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <CreateEventForm
        organizationId={organizationId}
        organizationName={organization.name}
      />
    </div>
  );
}
