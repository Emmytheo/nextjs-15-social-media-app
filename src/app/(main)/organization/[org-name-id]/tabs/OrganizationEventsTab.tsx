"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Ticket,
  Users,
  CheckCircle2,
  ArrowRight,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationWithCounts } from "../page";
import { EventWithDetails } from "@/app/(main)/events/[event-id]/page";

interface OrganizationEventsTabProps {
  organization: OrganizationWithCounts;
  isAdmin?: boolean;
}

export function OrganizationEventsTab({
  organization,
  isAdmin,
}: OrganizationEventsTabProps) {
  const events = (organization.events as EventWithDetails[] | undefined) || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all-events");

  const now = new Date();

  // Metrics derived specifically from this organization's real events
  const totalEvents = events.length;
  const upcomingEvents = useMemo(
    () => events.filter((e) => new Date(e.startDate) >= now),
    [events, now]
  );
  const pastEvents = useMemo(
    () => events.filter((e) => new Date(e.startDate) < now),
    [events, now]
  );

  const totalAttendees = useMemo(() => {
    return events.reduce((sum, e) => sum + (e.attendees?.length || 0), 0);
  }, [events]);

  const freeCount = useMemo(() => {
    return events.filter((e) => e.ticketType === "FREE" || !e.ticketPrice).length;
  }, [events]);

  const ticketedCount = totalEvents - freeCount;

  const eventStats = [
    {
      label: "Total Gatherings",
      value: totalEvents.toString(),
      subtext: "Hosted by this guild",
      icon: Calendar,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Upcoming Sessions",
      value: upcomingEvents.length.toString(),
      subtext: upcomingEvents.length > 0 ? "Open for registration" : "None scheduled",
      icon: Sparkles,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Total Registrations",
      value: totalAttendees.toString(),
      subtext: "Citizen RSVPs & passes",
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Admission Models",
      value: `${freeCount} Free`,
      subtext: ticketedCount > 0 ? `+ ${ticketedCount} Ticketed` : "Open Community Access",
      icon: Ticket,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  const filterEventsList = (list: EventWithDetails[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.venue && e.venue.toLowerCase().includes(q)) ||
        (e.location && e.location.toLowerCase().includes(q))
    );
  };

  const displayedAll = filterEventsList(events);
  const displayedUpcoming = filterEventsList(upcomingEvents);
  const displayedPast = filterEventsList(pastEvents);

  const renderEventList = (list: EventWithDetails[], emptyLabel: string) => {
    if (list.length === 0) {
      return (
        <Card className="p-8 text-center bg-card/50 border border-dashed rounded-2xl">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
          <h4 className="text-base font-bold mb-1">{emptyLabel}</h4>
          <p className="text-muted-foreground text-xs max-w-sm mx-auto mb-4">
            {searchQuery
              ? `No events match "${searchQuery}". Try clearing the search query.`
              : `There are currently no events to display in this section for ${organization.name}.`}
          </p>
          {isAdmin && (
            <Button asChild size="sm" className="rounded-xl font-bold">
              <Link href={`/events/create?organizationId=${organization.id}`}>
                <Plus className="mr-1.5 h-4 w-4" />
                Schedule New Event
              </Link>
            </Button>
          )}
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((event) => {
          const isUpcoming = new Date(event.startDate) >= now;

          return (
            <Card
              key={event.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-4 transition-all hover:shadow-lg hover:border-primary/40"
            >
              <div className="space-y-3">
                <div className="flex gap-3.5 items-start">
                  {/* Event Thumbnail */}
                  <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/10 to-primary/10 border relative">
                    {event.coverPhotoUrl || event.logoUrl ? (
                      <Image
                        src={event.coverPhotoUrl || event.logoUrl!}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-primary font-black text-sm">
                        <Calendar className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={event.ticketType === "FREE" || !event.ticketPrice ? "secondary" : "default"}
                        className="text-[10px] font-bold px-2 py-0"
                      >
                        {event.ticketType === "FREE" || !event.ticketPrice
                          ? "Free Entry"
                          : `$${event.ticketPrice}`}
                      </Badge>
                      {isUpcoming ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-2 py-0">
                          Upcoming
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-[10px] px-2 py-0">
                          Completed
                        </Badge>
                      )}
                    </div>

                    <Link href={`/events/${event.id}`}>
                      <h4 className="text-sm sm:text-base font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </h4>
                    </Link>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{formatDate(new Date(event.startDate), "MMM d, yyyy • p")}</span>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                )}

                {event.venue && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-border/50 text-xs">
                <span className="text-muted-foreground font-semibold flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  {event.attendees?.length || 0} RSVPs
                </span>

                <div className="flex items-center gap-1.5">
                  <Button asChild size="sm" variant="outline" className="rounded-xl h-8 px-2.5 text-xs font-semibold">
                    <Link href={`/events/${event.id}`}>
                      Details
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-card p-5 sm:p-7 border border-border/80 shadow-xs space-y-6">
      {/* Header with Title and Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Guild Events & Gatherings
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Townhalls, masterclasses, and civic workshops organized by {organization.name}.
          </p>
        </div>

        {isAdmin && (
          <Button asChild className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs">
            <Link href={`/events/create?organizationId=${organization.id}`}>
              <Plus className="mr-1.5 h-4 w-4" />
              Schedule Event
            </Link>
          </Button>
        )}
      </div>

      {/* Real Event Statistics Cards (Replaced duplicated members/posts stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {eventStats.map((stat, index) => (
          <Card key={index} className="p-4 sm:p-5 rounded-2xl border bg-muted/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground">{stat.label}</span>
              <div className={`h-8 w-8 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {stat.value}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1 font-medium">{stat.subtext}</div>
          </Card>
        ))}
      </div>

      {/* Search and Tabs */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="rounded-xl p-1 bg-muted/50 border">
              <TabsTrigger value="all-events" className="rounded-lg text-xs font-bold px-3">
                All Gatherings ({totalEvents})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="rounded-lg text-xs font-bold px-3">
                Upcoming ({upcomingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="rounded-lg text-xs font-bold px-3">
                Past Archives ({pastEvents.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guild events..."
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === "all-events" && renderEventList(displayedAll, "No events found")}
        {activeTab === "upcoming" && renderEventList(displayedUpcoming, "No upcoming gatherings")}
        {activeTab === "past" && renderEventList(displayedPast, "No past events recorded")}
      </div>
    </div>
  );
}
