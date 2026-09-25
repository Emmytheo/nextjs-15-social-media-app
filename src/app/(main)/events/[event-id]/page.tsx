import { validateRequest } from "@/auth";
import Linkify from "@/components/Linkify";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import prisma from "@/lib/prisma";
import { formatDate } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import EventProfile from "./EventProfile";
import { EventSidebar } from "@/components/EventSidebar";
import GalleryTab from "./GalleryTab";
import ActivitiesGamesTab from "./ActivitiesGamesTab";
import EventRsvpButton from "./EventRsvpButton";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Edit, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ "event-id": string }> | { "event-id": string };
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

export interface EventWithDetails {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  venue: string | null;
  address: string | null;
  coverPhotoUrl: string | null;
  logoUrl: string | null;
  ticketType: string | null;
  ticketPrice: number | null;
  ticketUrl: string | null;
  programmeOverview: string | null;
  status: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  attendees?: any;
  organization: {
    id: string;
    name: string;
    nameId?: string;
  };
  _count: {
    attendees: number;
  };
}

const getEvent = cache(async (eventId: string) => {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          attendees: true,
        },
      },
    },
  });

  if (!event) notFound();

  return event as unknown as EventWithDetails;
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const eventId = resolvedParams["event-id"];
  const event = await getEvent(eventId);

  return {
    title: `${event.title}`,
    description: event.description || `Event organized by ${event.organization.name}`,
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  const resolvedParams = await params;
  const eventId = resolvedParams["event-id"];
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const tabParam = resolvedSearchParams?.tab;
  const currentTab = (Array.isArray(tabParam) ? tabParam[0] : tabParam) || "overview";

  const event = await getEvent(eventId);

  let isRegistered = false;
  let isAdmin = false;

  if (loggedInUser) {
    const [attendee, admin] = await Promise.all([
      prisma.eventAttendee.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId: loggedInUser.id,
          },
        },
      }),
      prisma.organizationAdmin.findFirst({
        where: {
          userId: loggedInUser.id,
          organizationId: event.organizationId,
        },
      }),
    ]);

    isRegistered = !!attendee;
    isAdmin = !!admin;
  }

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <EventProfile
          event={event}
          loggedInUserId={loggedInUser?.id || ""}
          isRegistered={isRegistered}
        />
        <Tabs defaultValue={currentTab} className="w-full">
          <TabsList
            className="sticky top-[70px] z-10 w-full !justify-start overflow-x-auto shadow-md bg-background/95 dark:bg-muted backdrop-blur supports-[backdrop-filter]:bg-background/60"
            style={{ scrollbarWidth: "none" }}
          >
            <TabsTrigger value="overview" asChild>
              <Link href="?tab=overview" replace scroll={false}>Overview</Link>
            </TabsTrigger>
            <TabsTrigger value="tickets" asChild>
              <Link href="?tab=tickets" replace scroll={false}>Tickets</Link>
            </TabsTrigger>
            <TabsTrigger value="activities" asChild>
              <Link href="?tab=activities" replace scroll={false}>Activities</Link>
            </TabsTrigger>
            <TabsTrigger value="gallery" asChild>
              <Link href="?tab=gallery" replace scroll={false}>Gallery</Link>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Programme Overview</h3>
              {event.programmeOverview ? (
                <Linkify>
                  <div className="overflow-hidden whitespace-pre-line break-words text-muted-foreground leading-relaxed">
                    {event.programmeOverview}
                  </div>
                </Linkify>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <p>No programme overview available yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tickets">
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Ticket Information</h3>
                  {event.ticketType === "FREE" && (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium text-sm">
                      Free Entry
                    </span>
                  )}
                </div>

                {event.ticketType ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Ticket Type</p>
                      <p className="text-lg font-semibold capitalize">{event.ticketType.toLowerCase()}</p>
                    </div>
                    {event.ticketPrice && (
                      <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Price</p>
                        <p className="text-lg font-semibold">${event.ticketPrice}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Ticket information coming soon
                  </p>
                )}

                <div className="pt-4">
                  <EventRsvpButton
                    eventId={event.id}
                    isRegistered={isRegistered}
                    ticketUrl={event.ticketUrl}
                    ticketType={event.ticketType}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activities">
            <ActivitiesGamesTab eventId={eventId} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryTab eventId={eventId} isAdmin={isAdmin} />
          </TabsContent>
        </Tabs>
      </div>
      <EventSidebar
        event={event}
        isRegistered={isRegistered}
      />

      {isAdmin && (
        <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-3 md:hidden">
          <FloatingActionButton
            href={`/events/${event.id}/edit`}
            label="Edit Event"
            icon={<Edit className="h-6 w-6" />}
          />
        </div>
      )}

      {/* Desktop admin toolbar */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50 hidden md:flex items-center gap-2 rounded-xl border bg-card p-2 shadow-lg">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href={`/events/${event.id}/edit`}>
              <Edit className="size-4" />
              Edit Event
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-2">
            <Link href={`/events/${event.id}/manage`}>
              <LayoutDashboard className="size-4" />
              Manage Event
            </Link>
          </Button>
        </div>
      )}
    </main>
  );
}
