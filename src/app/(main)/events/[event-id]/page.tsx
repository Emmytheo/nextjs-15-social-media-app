import { validateRequest } from "@/auth";
import Linkify from "@/components/Linkify";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import prisma from "@/lib/prisma";
import { formatDate } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Image from "next/image";
import EventProfile from "./EventProfile";
import { EventSidebar } from "@/components/EventSidebar";
import GalleryTab from "./GalleryTab";
import ActivitiesGamesTab from "./ActivitiesGamesTab";
import { Button } from "@/components/ui/button";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Edit } from "lucide-react";

interface PageProps {
  params: { "event-id": string };
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
  attendees: any;
  organization: {
    id: string;
    name: string;
    nameId: string;
  };
  _count: {
    attendees: number;
  };
}

const getEvent = cache(async (eventId: string, loggedInUserId: string) => {
  console.log(eventId);
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      // isPublished: true,
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          // nameId: true,
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
  params: { "event-id": eventId },
}: PageProps): Promise<Metadata> {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return {};

  const event = await getEvent(eventId, loggedInUser.id);
  // console.log(event);

  return {
    title: `${event.title}`,
  };
}

export default async function Page({
  params: { "event-id": eventId },
}: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You're not authorized to view this page.
      </p>
    );
  }

  const event = await getEvent(eventId, loggedInUser.id);

  const isAdmin = await prisma.organizationAdmin.findFirst({
    where: {
      userId: loggedInUser.id,
      organizationId: event.organizationId,
    },
  });

  return (
    <main className="flex w-full min-w-0 gap-5 pb-20">
      <div className="w-full min-w-0 space-y-5">
        <EventProfile event={event} loggedInUserId={loggedInUser.id} />
        <Tabs defaultValue="overview" className="w-full">
          <TabsList
            className="sticky top-[70px] z-10 w-full !justify-start overflow-x-auto shadow-md bg-background/95 dark:bg-muted backdrop-blur supports-[backdrop-filter]:bg-background/60"
            style={{ scrollbarWidth: "none" }}
          >
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
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

                {event.ticketUrl && (
                  <div className="pt-4">
                    <Button asChild size="lg" className="w-full sm:w-auto">
                      <a
                        href={event.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Get Tickets
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activities">
            <ActivitiesGamesTab eventId={eventId} />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryTab eventId={eventId} />
          </TabsContent>
        </Tabs>
      </div>
      <EventSidebar event={event} />

      {isAdmin && (
        <FloatingActionButton
          href={`/events/${event.id}/edit`}
          label="Edit Event"
          icon={<Edit className="h-6 w-6" />}
        />
      )}
    </main>
  );
}
