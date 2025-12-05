import Linkify from "@/components/Linkify";
import { EventWithDetails } from "./page";
import Image from "next/image";
import { formatDate } from "date-fns";
import { Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface EventProfileProps {
  event: EventWithDetails;
  loggedInUserId: string;
}

function EventProfile({ event, loggedInUserId }: EventProfileProps) {
  return (
    <div className="flex w-full flex-col">
      {/* Cover Photo */}
      <div className="relative h-48 md:h-48 w-full flex-shrink-0 overflow-hidden rounded-t-2xl bg-muted">
        {event.coverPhotoUrl ? (
          <Image
            src={event.coverPhotoUrl}
            alt={`${event.title} cover`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
            <Calendar className="w-16 h-16 text-primary/40" />
          </div>
        )}
      </div>

      <div className="relative flex w-full flex-col gap-5 rounded-b-2xl bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Logo */}
          <div className="relative -mt-16 md:-mt-20 flex-shrink-0">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-card bg-muted overflow-hidden shadow-sm relative">
              {event.logoUrl ? (
                <Image
                  src={event.logoUrl}
                  alt={`${event.title} logo`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
                  <span className="text-2xl font-bold">{event.title.substring(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-2 pt-2">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{event.title}</h1>
                <div className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
                  <span>Organized by</span>
                  <Link
                    href={`/organization/${event.organization.id}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {event.organization.name}
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {event.category && (
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    {event.category}
                  </span>
                )}
                {event.ticketType === "FREE" && (
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-700 hover:bg-green-200">
                    Free
                  </span>
                )}
              </div>
            </div>


          </div>
        </div>

        <EventDetails event={event} />
        {/* Mobile Action Buttons */}
        <div className="flex md:hidden gap-3 mt-2">
          {event.ticketUrl ? (
            <Button asChild className="flex-1">
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {event.ticketType === "FREE" ? "Register" : "Get Tickets"}
              </a>
            </Button>
          ) : (
            <Button disabled className="flex-1" variant="outline">
              Tickets Coming Soon
            </Button>
          )}
        </div>

        {event.description && (
          <>
            <Separator />
            <Linkify>
              <div className="overflow-hidden whitespace-pre-line break-words text-sm leading-relaxed">
                {event.description}
              </div>
            </Linkify>
          </>
        )}
      </div>
    </div>
  );
}

function EventDetails({ event }: { event: EventWithDetails }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-muted-foreground mt-2">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        <span>
          {formatDate(event.startDate, "PPP")}
          {event.endDate && ` - ${formatDate(event.endDate, "PPP")}`}
        </span>
      </div>
      {event.venue && (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{event.venue}</span>
        </div>
      )}
      {event.location && (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{event.location}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <span>{event._count.attendees} Attendees</span>
      </div>
    </div>
  );
}

export default EventProfile;
