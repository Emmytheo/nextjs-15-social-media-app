"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "date-fns";
import { useState, useMemo } from "react";
import ky from "@/lib/ky";
import {
  Search,
  Plus,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  Compass,
  ShieldCheck,
  Filter,
  CalendarDays,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { getEvents, EventWithOrg } from "./events-api";
import { rsvpToEvent } from "./[event-id]/event-actions";

const CATEGORIES = [
  { label: "All Events", value: "ALL" },
  { label: "Technology & Hackathons", value: "TECH" },
  { label: "Community Townhalls", value: "TOWNHALL" },
  { label: "Fintech & Cooperatives", value: "FINTECH" },
  { label: "Creative & Music", value: "CREATIVE" },
  { label: "Workshops & Training", value: "WORKSHOP" },
];

const TIMEFRAMES = [
  { label: "All Time", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "This Week", value: "this-week" },
  { label: "This Month", value: "this-month" },
  { label: "Past Events", value: "past" },
];

export default function EventsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialOrgId = searchParams.get("organizationId") || "";
  const initialScope = searchParams.get("scope") || "all";

  const [scope, setScope] = useState<"all" | "my-guilds" | "attending" | "hosted">(
    (initialScope as any) || "all"
  );
  const [selectedOrgId, setSelectedOrgId] = useState<string>(initialOrgId);
  const [timeframe, setTimeframe] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedTicketType, setSelectedTicketType] = useState<"ALL" | "FREE" | "PAID">("ALL");

  const [rsvpModalEvent, setRsvpModalEvent] = useState<EventWithOrg | null>(null);
  const [rsvpRegistered, setRsvpRegistered] = useState<Record<string, boolean>>({});
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch list of organizations for the filter dropdown
  const { data: organizations = [] } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ["organizations", "all"],
    queryFn: async () => {
      try {
        const res = await ky.get("/api/organizations").json<any[]>();
        return res.map((org) => ({ id: org.id, name: org.name }));
      } catch {
        return [];
      }
    },
  });

  // Query events based on current scope, timeframe, organization, and search
  const { data: rawEvents, isLoading, refetch } = useQuery({
    queryKey: ["events", scope, timeframe, selectedOrgId, selectedCategory, selectedTicketType],
    queryFn: async () => {
      return await getEvents({
        scope,
        timeframe,
        organizationId: selectedOrgId || undefined,
        ticketType: selectedTicketType !== "ALL" ? selectedTicketType : undefined,
        category: selectedCategory !== "ALL" ? selectedCategory : undefined,
      });
    },
    retry: 3,
    staleTime: 30000,
  });

  // Query events for user's affiliated guilds to show quick bar & count
  const { data: myGuildsEvents = [] } = useQuery<EventWithOrg[]>({
    queryKey: ["events", "my-guilds-permanent-summary"],
    queryFn: async () => {
      try {
        return await getEvents({ scope: "my-guilds" });
      } catch {
        return [];
      }
    },
    staleTime: 60000,
  });

  const allEvents: EventWithOrg[] = rawEvents || [];

  // Local filtering for client search query and fine-grained matches
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const matchesQuery =
        !searchQuery.trim() ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.venue && event.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.organization && event.organization.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "ALL" ||
        (event.category &&
          (event.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            (selectedCategory === "TECH" && event.category.toLowerCase().includes("tech")) ||
            (selectedCategory === "CREATIVE" && event.category.toLowerCase().includes("creative")) ||
            (selectedCategory === "WORKSHOP" && event.category.toLowerCase().includes("workshop")) ||
            (selectedCategory === "TOWNHALL" && event.category.toLowerCase().includes("townhall")) ||
            (selectedCategory === "FINTECH" && event.category.toLowerCase().includes("fintech"))));

      const matchesTicket =
        selectedTicketType === "ALL" ||
        (selectedTicketType === "FREE" && (event.ticketType === "FREE" || !event.ticketPrice)) ||
        (selectedTicketType === "PAID" && event.ticketType === "PAID");

      return matchesQuery && matchesCategory && matchesTicket;
    });
  }, [allEvents, searchQuery, selectedCategory, selectedTicketType]);

  const spotlightEvent = filteredEvents[0];

  const handleRSVP = async (event: EventWithOrg) => {
    try {
      setRsvpSubmitting(true);
      const res = await rsvpToEvent(event.id);
      if (res.success) {
        setRsvpRegistered((prev) => ({ ...prev, [event.id]: true }));
        setRsvpModalEvent(null);
        refetch();
        toast({
          title: "RSVP Confirmed! 🎟️",
          description: `You are officially registered for "${event.title}". Access pass generated in your citizen profile.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "RSVP Failed",
          description: res.message,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not complete registration. Please sign in and try again.",
      });
    } finally {
      setRsvpSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setScope("all");
    setSelectedOrgId("");
    setTimeframe("all");
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedTicketType("ALL");
  };

  const hasActiveFilters =
    scope !== "all" ||
    selectedOrgId !== "" ||
    timeframe !== "all" ||
    searchQuery.trim() !== "" ||
    selectedCategory !== "ALL" ||
    selectedTicketType !== "ALL";

  return (
    <main className="flex w-full min-w-0 flex-col gap-6">
      {/* Header & Hero */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-indigo-500/10 p-5 sm:p-8 shadow-sm">
        <div className="absolute -right-12 -top-12 h-60 w-60 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            CommunityOS Event & Gathering Network
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Discover, Host & Connect at <span className="bg-gradient-to-r from-indigo-500 via-primary to-amber-500 bg-clip-text text-transparent">Community Events</span>.
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Attend developer hackathons, cooperative townhalls, creative masterclasses, and civic meetups. Secure digital tickets directly linked to your citizen profile.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild className="gap-2 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
              <Link href="/events/create">
                <Plus className="h-4 w-4" />
                Host New Event
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2 rounded-xl font-semibold">
              <Link href="/organization">
                <Users className="h-4 w-4 text-primary" />
                Explore Organizations
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Affiliated Gatherings Bar */}
      {myGuildsEvents.length > 0 && (
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-indigo-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Your Guild Gatherings ({myGuildsEvents.length})
              </h2>
            </div>
            <button
              onClick={() => setScope("my-guilds")}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Filter to My Guild Gatherings →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {myGuildsEvents.map((evt) => {
              const startDate = new Date(evt.startDate);
              return (
                <Link
                  key={evt.id}
                  href={`/events/${evt.id}`}
                  className="p-3 rounded-xl border border-border/60 bg-card hover:bg-accent/40 transition-colors block space-y-1.5 group"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-primary truncate max-w-[150px]">
                      {evt.organization?.name}
                    </span>
                    <Badge variant="outline" className="text-[9px] py-0 h-4 font-bold px-1.5">
                      {evt.ticketType === "FREE" ? "Free" : evt.ticketPrice ? `$${evt.ticketPrice}` : "Paid"}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-xs group-hover:text-primary transition-colors line-clamp-1">
                    {evt.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Clock className="size-3 shrink-0" />
                    <span>{formatDate(startDate, "MMM d, yyyy · h:mm a")}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Scope Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-muted/50 border border-border/60">
        <button
          onClick={() => setScope("all")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            scope === "all"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/40"
          }`}
        >
          <Compass className="h-4 w-4 text-primary" />
          All Gatherings
        </button>

        <button
          onClick={() => setScope("my-guilds")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            scope === "my-guilds"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/40"
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-indigo-500" />
          My Guilds & Memberships
          {myGuildsEvents.length > 0 && (
            <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold">
              {myGuildsEvents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setScope("attending")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            scope === "attending"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/40"
          }`}
        >
          <Ticket className="h-4 w-4 text-emerald-500" />
          My RSVPs / Attending
        </button>

        <button
          onClick={() => setScope("hosted")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            scope === "hosted"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/40"
          }`}
        >
          <Building2 className="h-4 w-4 text-amber-500" />
          Hosted by My Guilds
        </button>
      </div>

      {/* Multi-Filter Controls Bar */}
      <div className="space-y-4 rounded-2xl border bg-card p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Text Search */}
          <div className="lg:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, venue, host guild, or town..."
              className="pl-10 rounded-xl"
            />
          </div>

          {/* Organization Dropdown */}
          <div className="lg:col-span-4 relative">
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              aria-label="Filter by Organization"
              className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All Organizations & Guilds</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          {/* Admission Type Dropdown */}
          <div className="lg:col-span-3">
            <select
              value={selectedTicketType}
              onChange={(e) => setSelectedTicketType(e.target.value as any)}
              aria-label="Filter by Admission Type"
              className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Admission Types</option>
              <option value="FREE">Free Passes Only</option>
              <option value="PAID">Ticketed Only</option>
            </select>
          </div>
        </div>

        {/* Timeframe Pills & Category Chips */}
        <div className="flex flex-col gap-3 pt-2 border-t border-border/50">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Timeframe Selection */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                Schedule:
              </span>
              {TIMEFRAMES.map((tf) => (
                <Button
                  key={tf.value}
                  variant={timeframe === tf.value ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setTimeframe(tf.value)}
                  className={`rounded-xl text-xs h-7 px-2.5 font-semibold ${
                    timeframe === tf.value ? "border shadow-xs" : ""
                  }`}
                >
                  {tf.label}
                </Button>
              ))}
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-muted-foreground hover:text-foreground h-7 gap-1"
              >
                <X className="h-3.5 w-3.5" />
                Reset Filters
              </Button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
                className="rounded-full text-xs shrink-0 font-semibold h-7 px-3"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Spotlight Event (shown when in 'all' scope and spotlight exists) */}
      {scope === "all" && spotlightEvent && !searchQuery && (
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-xs font-bold gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Spotlight Gathering
            </Badge>
            <Badge variant="outline" className="text-xs font-mono text-muted-foreground">
              Starts {formatDate(new Date(spotlightEvent.startDate), "MMMM d, yyyy")}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  {spotlightEvent.organization?.name}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  {spotlightEvent.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                  {spotlightEvent.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">{spotlightEvent.venue || spotlightEvent.location || "Online"}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <span>{formatDate(new Date(spotlightEvent.startDate), "p")}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/60">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                  <Users className="h-4 w-4 text-primary" />
                  <span>
                    {Array.isArray(spotlightEvent.attendees) ? spotlightEvent.attendees.length : 0} Registered Citizens
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setRsvpModalEvent(spotlightEvent)}
                    className="gap-2 rounded-xl font-bold shadow-md"
                    disabled={rsvpRegistered[spotlightEvent.id]}
                  >
                    {rsvpRegistered[spotlightEvent.id] ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Attending
                      </>
                    ) : (
                      <>
                        <Ticket className="h-4 w-4" />
                        1-Click RSVP
                      </>
                    )}
                  </Button>
                  <Link href={`/events/${spotlightEvent.id}`}>
                    <Button variant="outline" className="gap-1.5 rounded-xl font-semibold">
                      Full Details
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 aspect-[16/11] relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500/10 via-muted to-muted/50 border flex items-center justify-center">
              {spotlightEvent.coverPhotoUrl || spotlightEvent.logoUrl ? (
                <img
                  src={spotlightEvent.coverPhotoUrl || spotlightEvent.logoUrl || ""}
                  alt={spotlightEvent.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground space-y-2">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-500">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <div className="font-bold text-foreground text-sm line-clamp-1">{spotlightEvent.organization?.name}</div>
                  <div className="text-xs text-muted-foreground">{spotlightEvent.category || "Featured Event"}</div>
                </div>
              )}
              <div className="absolute top-3 right-3">
                <Badge className="bg-background/90 text-foreground font-bold text-xs backdrop-blur shadow-sm">
                  {spotlightEvent.ticketType === "FREE" ? "Free Entry" : `$${spotlightEvent.ticketPrice}`}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Grid Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            {scope === "my-guilds" && "Events Hosted by Your Guilds"}
            {scope === "attending" && "Your Confirmed Gatherings"}
            {scope === "hosted" && "Events Managed by Your Guilds"}
            {scope === "all" && "All Community Gatherings"}
            <Badge variant="outline" className="font-mono text-xs">
              {filteredEvents.length}
            </Badge>
          </h2>
          <p className="text-xs text-muted-foreground">
            {scope === "my-guilds" && "Showing sessions organized by guilds you have joined or steward."}
            {scope === "attending" && "Events where you hold an active reservation or ticket pass."}
            {scope === "hosted" && "Events organized by guilds where you hold administrative steward privileges."}
            {scope === "all" && "Public events, hackathons, and townhalls open to the ecosystem."}
          </p>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden rounded-3xl">
              <div className="aspect-video w-full bg-muted animate-pulse" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-16 text-center border rounded-3xl bg-card/60 space-y-4">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold">
              {scope === "my-guilds"
                ? "No events found for your guilds"
                : scope === "attending"
                ? "You haven't RSVP'd to any events yet"
                : scope === "hosted"
                ? "No events managed by your guild admin roles"
                : "No events match your criteria"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {scope === "my-guilds"
                ? "Your guilds haven't posted upcoming events matching these filters yet. Switch to 'All Gatherings' to explore public events."
                : scope === "attending"
                ? "Browse all community gatherings and RSVP with one click to populate your passbook."
                : "Try resetting your search query or host a new gathering for your community."}
            </p>
          </div>
          <div className="flex justify-center gap-3">
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters} className="rounded-xl">
                Clear Filters
              </Button>
            )}
            <Button asChild className="gap-2 rounded-xl">
              <Link href="/events/create">
                <Plus className="h-4 w-4" />
                Host Community Event
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isRegistered =
              rsvpRegistered[event.id] ||
              (Array.isArray(event.attendees) &&
                event.attendees.some((att) => att.status === "REGISTERED" || att.status === "CONFIRMED"));

            return (
              <Card
                key={event.id}
                className="group flex flex-col overflow-hidden rounded-3xl border bg-card transition-all hover:shadow-xl hover:border-indigo-500/40"
              >
                {/* Image Cover */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-indigo-500/10 via-muted to-muted/50 flex items-center justify-center">
                  {event.coverPhotoUrl || event.logoUrl ? (
                    <img
                      src={event.coverPhotoUrl || event.logoUrl || ""}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center space-y-1.5">
                      <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground line-clamp-1">
                        {event.organization?.name || "Gathering"}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-background/90 text-foreground backdrop-blur font-bold text-xs shadow-sm">
                      {formatDate(new Date(event.startDate), "MMM d")}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="secondary"
                      className="bg-background/90 backdrop-blur text-[11px] font-bold text-foreground"
                    >
                      {event.ticketType === "FREE" ? "Free Entry" : `$${event.ticketPrice}`}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <Link
                      href={`/organization/${event.organization?.id}?tab=events`}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary hover:underline"
                    >
                      <Building2 className="h-3 w-3" />
                      {event.organization?.name || "Community Host"}
                    </Link>
                    <Link href={`/events/${event.id}`}>
                      <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t text-xs text-muted-foreground">
                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{formatDate(new Date(event.startDate), "p")}</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant={isRegistered ? "secondary" : "default"}
                        onClick={() => setRsvpModalEvent(event)}
                        disabled={isRegistered}
                        className="w-full rounded-xl text-xs font-bold gap-1.5"
                      >
                        {isRegistered ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            Registered
                          </>
                        ) : (
                          <>
                            <Ticket className="h-3.5 w-3.5" />
                            RSVP
                          </>
                        )}
                      </Button>
                      <Link href={`/events/${event.id}`}>
                        <Button size="sm" variant="outline" className="rounded-xl px-3 text-xs">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Instant RSVP Dialog */}
      <Dialog open={!!rsvpModalEvent} onOpenChange={(open) => !open && setRsvpModalEvent(null)}>
        <DialogContent className="sm:max-w-[420px]">
          {rsvpModalEvent && (
            <div className="space-y-4 pt-2">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                  <Ticket className="h-5 w-5 text-primary" />
                  Confirm Event Admission
                </DialogTitle>
                <DialogDescription>
                  Reserve your place for this gathering. An entry QR pass will be issued immediately.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-2xl border p-4 bg-muted/30 space-y-2 text-xs">
                <div className="font-bold text-sm text-foreground">{rsvpModalEvent.title}</div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>{formatDate(new Date(rsvpModalEvent.startDate), "EEEE, MMMM d, yyyy")}</span>
                </div>
                {rsvpModalEvent.venue && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{rsvpModalEvent.venue}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t font-semibold">
                  <span>Admission Tier:</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    {rsvpModalEvent.ticketType === "FREE" ? "Complimentary Pass ($0.00)" : `$${rsvpModalEvent.ticketPrice}`}
                  </Badge>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setRsvpModalEvent(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  onClick={() => handleRSVP(rsvpModalEvent)}
                  disabled={rsvpSubmitting}
                  className="font-bold rounded-xl shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {rsvpSubmitting ? "Confirming..." : "Confirm & Generate Pass"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
