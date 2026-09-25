import { EventWithDetails } from "@/app/(main)/events/[event-id]/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import EventRsvpButton from "@/app/(main)/events/[event-id]/EventRsvpButton";
import { Calendar, MapPin, Building2, Ticket, Users, CheckCircle2, Sparkles, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "date-fns";

interface EventSidebarProps {
  event: EventWithDetails;
  isRegistered?: boolean;
}

export function EventSidebar({ event, isRegistered = false }: EventSidebarProps) {
  const startDateObj = new Date(event.startDate);
  const endDateObj = event.endDate ? new Date(event.endDate) : null;
  const isEndDateValid = endDateObj && endDateObj.getTime() >= startDateObj.getTime();

  return (
    <div className="sticky top-[5.25rem] hidden h-fit w-72 xl:w-80 flex-none space-y-4 lg:block">
      <Card className="rounded-3xl border border-border/70 shadow-sm overflow-hidden bg-card">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span>Event Registration</span>
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-background">
              {event.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Quick Schedule */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Calendar className="size-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Date & Time</h4>
                <p className="text-sm font-semibold text-foreground">
                  {formatDate(startDateObj, "EEE, MMMM d, yyyy")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(startDateObj, "h:mm a")}
                  {isEndDateValid && endDateObj && ` - ${formatDate(endDateObj, "h:mm a")}`}
                </p>
              </div>
            </div>

            {/* Venue & Address */}
            {(event.venue || event.location || event.address) && (
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <MapPin className="size-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Location</h4>
                  {event.venue && (
                    <p className="text-sm font-semibold text-foreground truncate">{event.venue}</p>
                  )}
                  {event.location && (
                    <p className="text-xs text-muted-foreground truncate">{event.location}</p>
                  )}
                  {event.address && (
                    <p className="text-xs text-muted-foreground/80 truncate mt-0.5">{event.address}</p>
                  )}
                </div>
              </div>
            )}

            {/* Category */}
            {event.category && (
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Sparkles className="size-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Category</h4>
                  <p className="text-sm font-semibold text-foreground">{event.category}</p>
                </div>
              </div>
            )}
          </div>

          {/* Ticket & Attendance Badge */}
          <div className="rounded-2xl bg-muted/40 p-3 border border-border/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">Admission:</span>
              {event.ticketType === "FREE" ? (
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">Free RSVP</span>
              ) : event.ticketPrice ? (
                <span className="font-extrabold text-primary">${event.ticketPrice} USD</span>
              ) : (
                <span className="font-semibold text-foreground">Standard</span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">Confirmed Guests:</span>
              <span className="font-bold text-foreground">{event._count.attendees.toLocaleString()}</span>
            </div>
          </div>

          {/* Organization Info */}
          <div className="border-t border-border/50 pt-3">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Host Organization</h4>
              <span className="text-[10px] text-primary font-bold">Verified</span>
            </div>
            <Link
              href={`/organization/${event.organization.id}`}
              className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-muted/70 transition-colors border border-transparent hover:border-border/60 group"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Building2 className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                  {event.organization.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">View Guild Profile & Schemes</p>
              </div>
            </Link>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <EventRsvpButton
              eventId={event.id}
              isRegistered={isRegistered}
              ticketUrl={event.ticketUrl}
              ticketType={event.ticketType}
              className="w-full font-bold shadow-md hover:shadow-lg transition-all"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
