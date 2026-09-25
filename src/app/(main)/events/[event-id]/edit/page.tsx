import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditEventForm } from "./EditEventForm";
import { EventWithDetails } from "../page";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ "event-id": string }>;
}

export default async function EditEventPage({ params }: PageProps) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const { "event-id": eventId } = await params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organization: {
        select: { id: true, name: true },
        include: {
          admins: { where: { userId: user.id } },
          members: { where: { userId: user.id } },
        } as any,
      },
      _count: { select: { attendees: true } },
    },
  });

  if (!event) notFound();

  // Only organization admins can edit events
  const org = event.organization as any;
  const isAdmin = org.admins?.length > 0;

  if (!isAdmin) {
    redirect(`/events/${eventId}`);
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-yellow-100 text-yellow-800 border-yellow-200",
    PUBLISHED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
    COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Back navigation */}
      <div className="mb-6 flex items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href={`/events/${eventId}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Event
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Settings2 className="size-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Edit Event</CardTitle>
                <CardDescription className="mt-0.5">
                  Update details for{" "}
                  <span className="font-medium text-foreground">{event.title}</span>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[event.status] ?? "bg-muted text-muted-foreground"}`}
              >
                {event.status}
              </span>
              <span className="text-sm text-muted-foreground">
                {event._count.attendees} attendee{event._count.attendees !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Hosted by</span>
            <Link
              href={`/organization/${event.organization.id}`}
              className="font-medium text-primary hover:underline"
            >
              {event.organization.name}
            </Link>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <EditEventForm event={event as unknown as EventWithDetails & { status: string; isPublished: boolean; programmeOverview?: string | null }} />
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/events/${eventId}`}>View Public Page</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/events/${eventId}/manage`}>Manage Attendees</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/organization/${event.organization.id}`}>Community Profile</Link>
        </Button>
      </div>
    </div>
  );
}
