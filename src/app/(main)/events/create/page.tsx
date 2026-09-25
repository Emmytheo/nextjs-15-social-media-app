import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateEventForm } from "./CreateEventForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus, ArrowLeft } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ organizationId?: string }> | { organizationId?: string };
}

export default async function CreateEventPage({ searchParams }: PageProps) {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const targetOrgId = resolvedSearchParams.organizationId;

  // Find all organizations where the user is an admin
  const adminOrgs = await prisma.organizationAdmin.findMany({
    where: { userId: user.id },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
        },
      },
    },
  });

  // If user is not an admin of any organization, encourage them to create one
  if (adminOrgs.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8">
        <Card className="text-center p-6 border-dashed">
          <CardHeader>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
              <Building2 className="size-8" />
            </div>
            <CardTitle className="text-2xl font-bold">Community or Organization Required</CardTitle>
            <CardDescription className="text-base mt-2">
              Events on this platform are hosted by communities and organizations. You need to create or be an admin of an organization to host events.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg">
              <Link href="/organization">
                <Plus className="mr-2 size-5" />
                Create an Organization
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/events">
                <ArrowLeft className="mr-2 size-5" />
                Back to Events
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If targetOrgId is provided and valid, select that org
  const selectedOrg = targetOrgId
    ? adminOrgs.find((a) => a.organization.id === targetOrgId)?.organization
    : adminOrgs.length === 1
      ? adminOrgs[0].organization
      : null;

  if (selectedOrg) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/events">
              <ArrowLeft className="mr-2 size-4" />
              Back to Events
            </Link>
          </Button>
        </div>
        <CreateEventForm
          organizationId={selectedOrg.id}
          organizationName={selectedOrg.name}
        />
      </div>
    );
  }

  // If user has multiple organizations, let them pick which one to create an event for
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/events">
            <ArrowLeft className="mr-2 size-4" />
            Back to Events
          </Link>
        </Button>
      </div>

      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl font-bold">Select Organization</CardTitle>
          <CardDescription>
            Choose which organization or community will be hosting this event:
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-3">
          {adminOrgs.map(({ organization }) => (
            <Link
              key={organization.id}
              href={`/events/create?organizationId=${organization.id}`}
              className="flex items-center justify-between p-4 rounded-xl border transition-colors hover:bg-accent/50 hover:border-primary/50 group"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {organization.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold group-hover:text-primary transition-colors">
                    {organization.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">Click to host event</p>
                </div>
              </div>
              <Plus className="size-5 text-muted-foreground group-hover:text-primary" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
