"use client";

import PostEditor from "@/components/posts/editor/PostEditor";
import Link from "next/link";
import {
  Sparkles,
  Coins,
  Wallet,
  Calendar,
  Building2,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WelcomeHomeProps {
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

export default function WelcomeHome({ user }: WelcomeHomeProps) {
  const displayName = user?.displayName || user?.username || "Citizen";

  return (
    <div className="space-y-5">
      {/* CommunityOS Hero Command Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/10 p-4 sm:p-7 shadow-sm">
        {/* Glow orb */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-2xl pointer-events-none" />

        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold gap-1 px-2.5 py-0.5">
                <Sparkles className="h-3.5 w-3.5" />
                CommunityOS Hub
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-border/80">
                Copteller MFB Node
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ledger Online</span>
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">{displayName}</span>
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Explore live community discussions, back milestone-protected campaigns, manage your citizen escrow vault, or RSVP for upcoming events.
            </p>
          </div>

          {/* Quick Launch Action Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {/* Action 1: Crowdfunding */}
            <Link
              href="/crowdfunding"
              className="group flex flex-col justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-border/60 bg-background/60 hover:bg-background/90 hover:border-amber-500/40 transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Coins className="h-4 w-4" />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-3">
                <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Crowdfunding
                </div>
                <div className="text-[10px] text-muted-foreground">Milestone Escrow</div>
              </div>
            </Link>

            {/* Action 2: Vault & Wallet */}
            <Link
              href="/wallet"
              className="group flex flex-col justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-border/60 bg-background/60 hover:bg-background/90 hover:border-primary/40 transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Wallet className="h-4 w-4" />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-3">
                <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Citizen Vault
                </div>
                <div className="text-[10px] text-muted-foreground">MFB Clearing</div>
              </div>
            </Link>

            {/* Action 3: Events */}
            <Link
              href="/events"
              className="group flex flex-col justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-border/60 bg-background/60 hover:bg-background/90 hover:border-indigo-500/40 transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-3">
                <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Events
                </div>
                <div className="text-[10px] text-muted-foreground">Meetups & RSVPs</div>
              </div>
            </Link>

            {/* Action 4: Guilds & Communities */}
            <Link
              href="/organization"
              className="group flex flex-col justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-border/60 bg-background/60 hover:bg-background/90 hover:border-emerald-500/40 transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-3">
                <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Guilds
                </div>
                <div className="text-[10px] text-muted-foreground">Cooperatives</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Post Composer */}
      <PostEditor />
    </div>
  );
}
