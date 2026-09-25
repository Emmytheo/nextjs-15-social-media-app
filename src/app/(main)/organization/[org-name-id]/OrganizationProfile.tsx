"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDate } from "date-fns";
import { formatNumber } from "@/lib/utils";
import Linkify from "@/components/Linkify";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import EditOrganizationButton from "./EditOrganizationButton";
import { JoinOrganizationButton } from "./JoinOrganizationButton";
import {
  Building2,
  Calendar,
  Users,
  FileText,
  Sparkles,
  CheckCircle2,
  Share2,
  Check,
  ShieldCheck,
} from "lucide-react";
import type { OrganizationWithCounts } from "./page";

export interface OrganizationProfileProps {
  organization: OrganizationWithCounts;
  loggedInUserId?: string;
}

export function OrganizationProfile({
  organization,
  loggedInUserId,
}: OrganizationProfileProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const isAdmin = organization.admins?.some((a) => a.userId === loggedInUserId) ?? false;

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast({ description: "Guild link copied to clipboard! 📋" });
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast({ description: "Unable to copy link" });
    }
  };

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all">
      {/* ── 1. Hero Cover Banner ────────────────────────────────────────── */}
      <div className="relative h-36 sm:h-48 md:h-52 w-full flex-shrink-0 overflow-hidden bg-gradient-to-tr from-primary/30 via-amber-500/15 to-purple-600/20 dark:from-primary/20 dark:via-background dark:to-muted border-b border-border/40">
        {organization.bannerUrl ? (
          <>
            <Image
              src={organization.bannerUrl}
              alt={`${organization.name} banner`}
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
              <Building2 className="h-14 w-14 stroke-1" />
              <span className="text-[11px] uppercase tracking-widest font-bold">CommunityOS Guild Hub</span>
            </div>
          </div>
        )}

        {/* Floating Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10 pointer-events-none">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide backdrop-blur-md bg-background/85 text-foreground shadow-sm border border-border/50">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Community Guild
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md bg-background/85 text-muted-foreground shadow-sm border border-border/50">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Verified Organization</span>
          </div>
        </div>
      </div>

      {/* ── 2. Identity & Name Card Body ─────────────────────────────────── */}
      <div className="relative flex w-full flex-col gap-5 p-4 sm:p-6 lg:p-7">
        {/* Top Header Row: Anchor Logo on left, Actions on right */}
        <div className="flex items-end justify-between gap-4 -mt-12 sm:-mt-14 md:-mt-16 mb-1">
          {/* Logo / Emblem */}
          <div className="relative flex-shrink-0 z-10">
            <div className="size-20 sm:size-24 md:size-28 rounded-2xl border-4 border-card bg-card shadow-lg overflow-hidden relative">
              {organization.logoUrl ? (
                <Image
                  src={organization.logoUrl}
                  alt={`${organization.name} logo`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="size-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-amber-500/15 text-primary font-black text-2xl sm:text-3xl">
                  {organization.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons Cluster (Desktop & Tablet) */}
          <div className="flex items-center gap-2 pt-1 flex-wrap justify-end">
            <JoinOrganizationButton
              organizationId={organization.id}
              organizationName={organization.name}
              isInitiallyMember={organization.members?.some((m) => m.userId === loggedInUserId) ?? false}
              loggedInUserId={loggedInUserId}
            />

            {isAdmin && (
              <EditOrganizationButton organization={organization} />
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              title="Share organization link"
              className="h-10 w-10 rounded-xl shrink-0"
            >
              {copied ? <Check className="size-4 text-emerald-600" /> : <Share2 className="size-4" />}
            </Button>
          </div>
        </div>

        {/* Title & Organization Information (FULL WIDTH) */}
        <div className="space-y-2 pt-1">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-snug">
            {organization.name}
          </h1>

          {/* Subtitle & Status Row */}
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground flex-wrap">
            <span className="font-semibold text-muted-foreground">
              @{organization.name.toLowerCase().replace(/\s+/g, "-")}
            </span>
            <CheckCircle2 className="size-4 text-primary fill-primary/20" />
            <span className="text-border">•</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="size-3" />
              Verified Community Hub
            </span>
          </div>
        </div>

        {/* ── 3. Quick Metadata Ribbon (Grid of Info Chips) ──────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Established Date */}
          <div className="flex flex-col justify-between rounded-2xl bg-muted/40 p-3.5 border border-border/60 hover:bg-muted/60 transition-colors gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="size-3.5" />
              </div>
              <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Established</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {formatDate(new Date(organization.createdAt), "MMMM d, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">
                Founded Community Guild
              </p>
            </div>
          </div>

          {/* Citizen Members */}
          <div className="flex flex-col justify-between rounded-2xl bg-muted/40 p-3.5 border border-border/60 hover:bg-muted/60 transition-colors gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Users className="size-3.5" />
              </div>
              <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Membership</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {formatNumber(organization._count?.members || 0)} Citizen Member{(organization._count?.members || 0) === 1 ? "" : "s"}
              </p>
              <p className="text-xs text-muted-foreground">
                Enrolled Community Members
              </p>
            </div>
          </div>

          {/* Hub Posts & Updates */}
          <div className="flex flex-col justify-between rounded-2xl bg-muted/40 p-3.5 border border-border/60 hover:bg-muted/60 transition-colors gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FileText className="size-3.5" />
              </div>
              <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Discussions</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">
                {formatNumber(organization._count?.posts || 0)} Hub Post{(organization._count?.posts || 0) === 1 ? "" : "s"}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                Active Public Feed
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. Organization Mission & Narrative ───────────────────────── */}
        {organization.description && (
          <div className="space-y-2 pt-2">
            <Separator className="opacity-60" />
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                About this Guild
              </h3>
              <Linkify>
                <div className="overflow-hidden whitespace-pre-line break-words text-sm text-foreground/90 leading-relaxed">
                  {organization.description}
                </div>
              </Linkify>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
