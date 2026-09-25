"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Coins,
  Wallet,
  Calendar,
  Building2,
  ArrowUpRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Crown,
  ShieldCheck,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "date-fns";

interface OrgItem {
  id: string;
  name: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  admins?: Array<{ userId: string }>;
  _count?: {
    members: number;
    events: number;
    posts?: number;
  };
}

interface EventItem {
  id: string;
  title: string;
  startDate: string | Date;
  venue?: string | null;
  ticketType?: string | null;
  ticketPrice?: number | null;
  organization?: {
    id: string;
    name: string;
    logoUrl?: string | null;
  };
  attendees?: Array<{ id: string; status: string }>;
}

interface HomeHeroCarouselProps {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  userOrganizations?: OrgItem[];
  userEvents?: EventItem[];
}

export default function HomeHeroCarousel({
  user,
  userOrganizations = [],
  userEvents = [],
}: HomeHeroCarouselProps) {
  const displayName = user?.displayName || user?.username || "Citizen";

  // Slides:
  // 0: Overview & Quick Hub
  // 1: My Sovereign Guilds (if any)
  // 2: Upcoming Gatherings (if any)
  const slides = [
    { id: "overview", label: "Hub Overview", icon: Sparkles },
    ...(userOrganizations.length > 0
      ? [{ id: "guilds", label: `My Guilds (${userOrganizations.length})`, icon: Building2 }]
      : []),
    ...(userEvents.length > 0
      ? [{ id: "events", label: `Upcoming Gatherings (${userEvents.length})`, icon: Calendar }]
      : []),
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch and drag swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  // Handle touch gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/10 shadow-sm transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="CommunityOS Hero Carousel"
    >
      {/* Background ambient lighting */}
      <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Top Header Bar: Slide Switcher Tabs & Status */}
      <div className="relative px-4 sm:px-6 pt-4 sm:pt-5 pb-2 flex flex-wrap items-center justify-between gap-2 border-b border-border/40">
        {/* Slide Switcher Pill Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/60">
          {slides.map((s, idx) => {
            const Icon = s.icon;
            const active = currentSlide === idx;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? "bg-background text-foreground shadow-xs scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                }`}
              >
                <Icon className={`size-3.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Node Status & Navigation Arrows */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Copteller Node Online</span>
          </div>

          {slides.length > 1 && (
            <div className="flex items-center gap-1 pl-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Previous slide"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Next slide"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Slides Container */}
      <div className="relative p-4 sm:p-6 min-h-[195px] flex flex-col justify-center">
        {/* SLIDE 0: Overview & Quick Launchpad */}
        {currentSlide === 0 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary mb-1">
                <Sparkles className="size-3.5" />
                <span>CommunityOS Operating System</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Welcome back, <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">{displayName}</span>
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 max-w-xl leading-relaxed">
                Explore community feed discussions, manage autonomous guild treasuries, or access upcoming summits.
              </p>
            </div>

            {/* Quick Launchpad Action Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <Link
                href="/crowdfunding"
                className="group flex flex-col justify-between p-2.5 rounded-xl border border-border/60 bg-background/60 hover:bg-background/95 hover:border-amber-500/40 transition-all hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Coins className="h-3.5 w-3.5" />
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    Crowdfunding
                  </div>
                  <div className="text-[10px] text-muted-foreground">Milestone Escrow</div>
                </div>
              </Link>

              <Link
                href="/wallet"
                className="group flex flex-col justify-between p-2.5 rounded-xl border border-border/60 bg-background/60 hover:bg-background/95 hover:border-primary/40 transition-all hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Wallet className="h-3.5 w-3.5" />
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    Fintech Vault
                  </div>
                  <div className="text-[10px] text-muted-foreground">Copteller MFB</div>
                </div>
              </Link>

              <Link
                href="/events"
                className="group flex flex-col justify-between p-2.5 rounded-xl border border-border/60 bg-background/60 hover:bg-background/95 hover:border-indigo-500/40 transition-all hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    Events
                  </div>
                  <div className="text-[10px] text-muted-foreground">Summits & RSVPs</div>
                </div>
              </Link>

              <Link
                href="/organization"
                className="group flex flex-col justify-between p-2.5 rounded-xl border border-border/60 bg-background/60 hover:bg-background/95 hover:border-emerald-500/40 transition-all hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    Guilds
                  </div>
                  <div className="text-[10px] text-muted-foreground">Cooperatives</div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* SLIDE 1: My Sovereign Guilds */}
        {currentSlide === 1 && userOrganizations.length > 0 && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Building2 className="size-4 text-primary" />
                  My Sovereign Guilds ({userOrganizations.length})
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Communities where you hold citizen membership or stewardship
                </p>
              </div>
              <Link
                href="/organization?scope=my-guilds"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                All Guilds
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {userOrganizations.slice(0, 3).map((org) => {
                const isOrgAdmin = org.admins && org.admins.length > 0;
                return (
                  <div
                    key={org.id}
                    className="flex flex-col justify-between p-3 rounded-xl border border-border/60 bg-background/70 hover:bg-background transition-all hover:shadow-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs text-primary shrink-0 overflow-hidden border border-border/50">
                        {org.logoUrl ? (
                          <Image src={org.logoUrl} alt={org.name} width={32} height={32} className="object-cover size-full" />
                        ) : (
                          org.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/organization/${org.id}`}
                          className="font-bold text-xs hover:text-primary transition-colors line-clamp-1 block"
                        >
                          {org.name}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {isOrgAdmin ? (
                            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] py-0 px-1 h-3.5 font-bold">
                              <Crown className="size-2 mr-0.5" />
                              Steward
                            </Badge>
                          ) : (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] py-0 px-1 h-3.5 font-bold">
                              <ShieldCheck className="size-2 mr-0.5" />
                              Member
                            </Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {org._count?.members || 1} citizens
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/40 text-[11px]">
                      <Link
                        href={`/organization/${org.id}`}
                        className="text-primary font-bold hover:underline flex items-center gap-0.5"
                      >
                        Enter Guild
                        <ArrowRight className="size-3" />
                      </Link>
                      {isOrgAdmin && (
                        <Link
                          href={`/wallet?organizationId=${org.id}`}
                          className="text-muted-foreground hover:text-amber-500 transition-colors flex items-center gap-0.5 font-medium"
                          title="Guild Vault"
                        >
                          <Coins className="size-3 text-amber-500" />
                          Vault
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SLIDE 2: Upcoming Guild Gatherings */}
        {((currentSlide === 2 && userEvents.length > 0) || (currentSlide === 1 && userOrganizations.length === 0 && userEvents.length > 0)) && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="size-4 text-amber-500" />
                  Upcoming Guild Gatherings ({userEvents.length})
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Events hosted by your affiliated community guilds
                </p>
              </div>
              <Link
                href="/events?scope=my-guilds"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                All Gatherings
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {userEvents.slice(0, 3).map((evt) => {
                const startDate = new Date(evt.startDate);
                return (
                  <Link
                    key={evt.id}
                    href={`/events/${evt.id}`}
                    className="flex flex-col justify-between p-3 rounded-xl border border-border/60 bg-background/70 hover:bg-background transition-all hover:shadow-xs group space-y-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        <span className="font-bold text-primary truncate max-w-[120px]">
                          {evt.organization?.name}
                        </span>
                        <Badge variant="outline" className="text-[9px] py-0 h-3.5 font-bold px-1">
                          {evt.ticketType === "FREE" ? "Free" : evt.ticketPrice ? `$${evt.ticketPrice}` : "Paid"}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                        {evt.title}
                      </h4>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="size-2.5 shrink-0" />
                        <span>{formatDate(startDate, "MMM d, h:mm a")}</span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-border/40 flex items-center justify-between text-[11px]">
                      <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                        {evt.venue || "Community Hall"}
                      </span>
                      <span className="text-primary font-bold flex items-center gap-0.5 group-hover:underline">
                        Details
                        <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Indicators */}
      {slides.length > 1 && (
        <div className="px-6 pb-3 pt-0 flex items-center justify-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                currentSlide === idx ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
