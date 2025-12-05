"use client";


import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import ky from "@/lib/ky";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Linkify from "@/components/Linkify";
import Image from "next/image";
import { formatDate } from "date-fns";
import { ReactNode, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Plus, MapPin, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingActionButton } from "@/components/FloatingActionButton";

interface EventWithOrg {
  image: any;
  date: string | number | Date;
  participants: ReactNode;
  goal: ReactNode;
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
  organization: {
    id: string;
    name: string;
  };
  attendees?: any
}

interface GetEventsParams {
  organizationId?: string | null;
}

async function getEvents({ organizationId }: GetEventsParams): Promise<EventWithOrg[]> {
  return ky
    .get("/api/events", {
      ...(organizationId && {
        searchParams: { organizationId },
      }),
    })
    .json();
}

export default function EventsPage() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get('organizationId');
  const [searchQuery, setSearchQuery] = useState("");

  const { data: events, isLoading, isError } = useQuery({
    queryKey: ["events", organizationId || "all"],
    queryFn: () => getEvents({ organizationId }),
  });

  const filteredEvents = events?.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.venue?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button asChild className="hidden md:flex">
            <Link href="/events/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video w-full bg-muted animate-pulse" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-destructive">
          <p className="text-lg font-medium">Failed to load events</p>
          <p className="text-sm">Please try again later.</p>
        </div>
      ) : !filteredEvents || filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Calendar className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">No events found</p>
          <p className="text-sm">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEvents.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="group block h-full"
            >
              <Card className="h-full overflow-hidden transition-all hover:shadow-md hover:border-primary/50 flex flex-col">
                <div className="aspect-video w-full relative bg-muted overflow-hidden">
                  {event.coverPhotoUrl || event.logoUrl ? (
                    <Image
                      src={event.coverPhotoUrl || event.logoUrl!}
                      alt={`${event.title} cover`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary/50 text-muted-foreground">
                      <Calendar className="h-12 w-12 opacity-20" />
                    </div>
                  )}
                  {event.startDate && (
                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-semibold shadow-sm">
                      {formatDate(event.startDate, "MMM d")}
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <div>
                    <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.organization.name}
                    </p>
                  </div>

                  <div className="mt-auto space-y-2 text-sm text-muted-foreground">
                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    )}
                    {event.startDate && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{formatDate(event.startDate, "t")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <FloatingActionButton href="/events/create" label="Create Event" />
    </div>
  );
}
