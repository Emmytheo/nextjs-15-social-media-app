"use client";

import Linkify from "@/components/Linkify";
import { EventWithDetails } from "./page";
import Image from "next/image";
import { formatDate } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
  Building2,
  Share2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import EventRsvpButton from "./EventRsvpButton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface EventProfileProps {
  event: EventWithDetails;
  loggedInUserId: string;
  isRegistered?: boolean;
}

export default function EventProfile({
  event,
  loggedInUserId,
  isRegistered = false,
}: EventProfileProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const startDateObj = new Date(event.startDate);
  const endDateObj = event.endDate ? new Date(event.endDate) : null;
  const isEndDateValid = endDateObj && endDateObj.getTime() >= startDateObj.getTime();

  const monthStr = formatDate(startDateObj, "MMM").toUpperCase();
  const dayStr = formatDate(startDateObj, "dd");
  const weekdayStr = formatDate(startDateObj, "EEE").toUpperCase();
  const timeStr = formatDate(startDateObj, "h:mm a");

  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast({ description: "Event link copied to clipboard! 📋" });
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast({ description: "Unable to copy link" });
    }
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description || `Event organized by ${event.organization.name}`);
    const location = encodeURIComponent([event.venue, event.address, event.location].filter(Boolean).join(", "));
    
    // Format YYYYMMDDTHHmmssZ
    const formatGDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");
    const startG = formatGDate(startDateObj);
    const endG = isEndDateValid && endDateObj
      ? formatGDate(endDateObj)
      : formatGDate(new Date(startDateObj.getTime() + 2 * 60 * 60 * 1000)); // default 2 hours

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startG}/${endG}&details=${details}&location=${location}`;
  };

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all">
      {/* ── 1. Hero Cover Banner ────────────────────────────────────────── */}
      <div className="relative h-48 sm:h-60 w-full flex-shrink-0 overflow-hidden bg-gradient-to-tr from-primary/30 via-amber-500/15 to-purple-600/20 dark:from-primary/20 dark:via-background dark:to-muted">
        {event.coverPhotoUrl ? (
          <>
            <Image
              src={event.coverPhotoUrl}
              alt={`${event.title} cover`}
              fill
              sizes="(max-width: 1200px) 100vw, 850px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
            <div className="flex flex-col items-center gap-2 text-primary/40 dark:text-primary/30">
              <Calendar className="h-16 w-16 stroke-1" />
              <span className="text-xs uppercase tracking-widest font-semibold">CommunityOS Event Gathering</span>
            </div>
          </div>
        )}

        {/* Floating Top Status Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10 pointer-events-none">
          <div className="flex items-center gap-2 flex-wrap">
            {event.category && (
              <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide backdrop-blur-md bg-background/85 text-foreground shadow-sm border border-border/50">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                {event.category}
              </span>
            )}
            <span className="pointer-events-auto inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-md bg-background/85 text-foreground shadow-sm border border-border/50">
              {event.ticketType === "FREE" ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Free Admission</span>
              ) : event.ticketPrice ? (
                <span className="text-primary font-bold">${event.ticketPrice} Entry</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-bold">Registration Required</span>
              )}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md bg-background/85 text-muted-foreground shadow-sm border border-border/50">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Community Verified</span>
          </div>
        </div>
      </div>

      {/* ── 2. Identity & Name Card Body ─────────────────────────────────── */}
      <div className="relative flex w-full flex-col gap-5 p-4 sm:p-6 lg:p-7">
        {/* Top Header Row: Anchor Emblem on left, Actions on right */}
        <div className="flex items-end justify-between gap-4 -mt-12 sm:-mt-14 lg:-mt-16 mb-1">
          {/* Calendar Emblem / Event Logo Anchor */}
          <div className="relative flex-shrink-0 z-10">
            {event.logoUrl ? (
              <div className="size-20 sm:size-24 lg:size-28 rounded-2xl border-4 border-card bg-card shadow-lg overflow-hidden relative">
                <Image
                  src={event.logoUrl}
                  alt={`${event.title} logo`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 rounded-2xl border-4 border-card bg-card shadow-lg flex flex-col items-center justify-between overflow-hidden text-center transition-transform hover:scale-105">
                <div className="w-full bg-gradient-to-r from-primary to-amber-500 py-1 text-primary-foreground text-[10px] sm:text-xs font-black tracking-wider uppercase">
                  {monthStr}
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight my-auto">
                  {dayStr}
                </div>
                <div className="w-full bg-muted/80 py-0.5 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {weekdayStr}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons (Desktop & Tablet) */}
          <div className="flex items-center gap-2 pt-1 flex-wrap justify-end">
            <div className="hidden sm:block">
              <EventRsvpButton
                eventId={event.id}
                isRegistered={isRegistered}
                ticketUrl={event.ticketUrl}
                ticketType={event.ticketType}
                className="font-bold shadow-sm hover:shadow-md transition-all h-10 px-5"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              title="Share event link"
              className="h-10 w-10 rounded-xl shrink-0"
            >
              {copied ? <Check className="size-4 text-emerald-600" /> : <Share2 className="size-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-10 text-xs font-semibold rounded-xl shrink-0 gap-1.5 px-3"
            >
              <a href={getGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer" title="Add to Google Calendar">
                <Calendar className="size-3.5 text-primary" />
                <span className="hidden sm:inline">Calendar</span>
              </a>
            </Button>
          </div>
        </div>

        {/* Title & Host Meta Information (FULL WIDTH) */}
        <div className="space-y-2.5">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-snug">
            {event.title}
          </h1>

          {/* Host Guild Pill & Meta Row */}
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">Organized by</span>
            <Link
              href={`/organization/${event.organization.id}`}
              className="inline-flex items-center gap-1.5 font-bold text-foreground hover:text-primary transition-colors bg-muted/60 hover:bg-muted/90 px-3 py-1 rounded-full border border-border/70 text-xs sm:text-sm shadow-sm"
            >
              <Building2 className="size-3.5 text-primary" />
              <span>{event.organization.name}</span>
              <CheckCircle2 className="size-3.5 text-primary fill-primary/20 ml-0.5" />
            </Link>

            {event.category && (
              <>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Sparkles className="size-3 text-amber-500" />
                  {event.category}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Mobile Primary RSVP CTA (< sm screen only) */}
        <div className="block sm:hidden pt-0.5">
          <EventRsvpButton
            eventId={event.id}
            isRegistered={isRegistered}
            ticketUrl={event.ticketUrl}
            ticketType={event.ticketType}
            className="w-full font-bold shadow-md h-11"
          />
        </div>

        {/* ── 3. Quick Metadata Ribbon (Grid of Info Chips) ──────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Date & Time */}
          <div className="flex flex-col justify-between rounded-2xl bg-muted/40 p-3.5 border border-border/60 hover:bg-muted/60 transition-colors gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="size-3.5" />
              </div>
              <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Date & Time</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate" title={formatDate(startDateObj, "EEEE, MMMM d, yyyy")}>
                {formatDate(startDateObj, "MMMM d, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {timeStr}
                {isEndDateValid && endDateObj && ` - ${formatDate(endDateObj, "h:mm a")}`}
              </p>
            </div>
          </div>

          {/* Venue / Location */}
          <div className="flex flex-col justify-between rounded-2xl bg-muted/40 p-3.5 border border-border/60 hover:bg-muted/60 transition-colors gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <MapPin className="size-3.5" />
              </div>
              <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Location</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate" title={event.venue || "Venue Announced Inside"}>
                {event.venue || "Venue Announced Inside"}
              </p>
              <p className="text-xs text-muted-foreground truncate" title={[event.address, event.location].filter(Boolean).join(", ") || "Community Portal"}>
                {event.location || event.address || "Community Portal"}
              </p>
            </div>
          </div>

          {/* Attendees / Capacity */}
          <div className="flex flex-col justify-between rounded-2xl bg-muted/40 p-3.5 border border-border/60 hover:bg-muted/60 transition-colors gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Users className="size-3.5" />
              </div>
              <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Attendance</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">
                {event._count.attendees.toLocaleString()} Confirmed RSVP{event._count.attendees === 1 ? "" : "s"}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                {event.ticketType === "FREE" ? "Free Admission" : event.ticketPrice ? `$${event.ticketPrice} Entry` : "Open to Guild & Citizens"}
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. Event Narrative & Description ────────────────────────────── */}
        {event.description && (
          <div className="space-y-2 pt-2">
            <Separator className="opacity-60" />
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                About this Gathering
              </h3>
              <Linkify>
                <div className="overflow-hidden whitespace-pre-line break-words text-sm text-foreground/90 leading-relaxed">
                  {event.description}
                </div>
              </Linkify>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
