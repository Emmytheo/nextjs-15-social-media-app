"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import ky from "@/lib/ky";
import {
  Building2,
  Search,
  Plus,
  Users,
  ShieldCheck,
  Coins,
  ArrowRight,
  Sparkles,
  Layers,
  Award,
  Crown,
  Calendar,
  Folder,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateOrganizationForm } from "./[org-name-id]/CreateOrganizationForm";

interface OrgItem {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  isAdmin?: boolean;
  isMember?: boolean;
  userRole?: "ADMIN" | "MEMBER" | null;
  _count?: {
    members: number;
    events: number;
    programs: number;
    posts: number;
  };
  memberCount?: number;
}

export default function OrganizationsPage() {
  const [scope, setScope] = useState<"all" | "my-guilds" | "managed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  // Main organizations query for current scope
  const { data: rawOrgs, isLoading } = useQuery<OrgItem[]>({
    queryKey: ["organizations", scope],
    queryFn: async () => {
      const url = scope !== "all" ? `/api/organizations?scope=${scope}` : "/api/organizations";
      return await ky.get(url).json<OrgItem[]>();
    },
    retry: 3,
    staleTime: 30000,
  });

  // Query all organizations to get permanent member / steward counts
  const { data: allUserOrgs } = useQuery<OrgItem[]>({
    queryKey: ["organizations", "all-user-summary"],
    queryFn: async () => {
      try {
        return await ky.get("/api/organizations").json<OrgItem[]>();
      } catch {
        return [];
      }
    },
    staleTime: 60000,
  });

  const allOrgs = rawOrgs || [];
  const referenceList = allUserOrgs || allOrgs;

  const myGuildsList = referenceList.filter((o) => o.isMember || o.isAdmin);
  const myGuildsCount = myGuildsList.length;
  const managedCount = referenceList.filter((o) => o.isAdmin).length;

  const filteredOrgs = allOrgs.filter((org) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      org.name.toLowerCase().includes(q) ||
      (org.description && org.description.toLowerCase().includes(q))
    );
  });

  return (
    <main className="flex w-full min-w-0 flex-col gap-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-emerald-500/10 p-5 sm:p-8 shadow-sm">
        <div className="absolute -right-12 -top-12 h-60 w-60 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            Autonomous Community Guilds & Cooperatives
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Sovereign Guilds with <span className="bg-gradient-to-r from-emerald-500 via-primary to-amber-500 bg-clip-text text-transparent">Verified MFB Treasuries</span>.
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Collaborate, govern, and pool resources within autonomous community organizations. Every guild is equipped with an integrated multi-signature treasury, dues collection, and milestone escrow voting.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                  <Plus className="h-4 w-4" />
                  Establish New Guild
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-bold text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Register New Community Guild
                  </DialogTitle>
                </DialogHeader>
                <CreateOrganizationForm />
              </DialogContent>
            </Dialog>

            <Button asChild variant="outline" className="gap-2 rounded-xl font-semibold">
              <Link href="/wallet">
                <Coins className="h-4 w-4 text-amber-500" />
                Fintech Vault
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Your Affiliated Communities Quick Bar (shown when user is part of guilds) */}
      {myGuildsList.length > 0 && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Your Community Guilds ({myGuildsList.length})
              </h2>
            </div>
            <button
              onClick={() => setScope("my-guilds")}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Filter to My Guilds →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {myGuildsList.map((g) => (
              <Link
                key={g.id}
                href={`/organization/${g.id}`}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-card hover:bg-accent/40 transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs text-primary shrink-0 overflow-hidden">
                    {g.logoUrl ? (
                      <Image src={g.logoUrl} alt={g.name} width={28} height={28} className="object-cover size-full" />
                    ) : (
                      g.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="font-bold text-xs group-hover:text-primary truncate">{g.name}</span>
                </div>
                {g.isAdmin ? (
                  <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] py-0 px-1.5 h-4 font-bold shrink-0">
                    <Crown className="size-2.5 mr-0.5" />
                    Steward
                  </Badge>
                ) : (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] py-0 px-1.5 h-4 font-bold shrink-0">
                    <ShieldCheck className="size-2.5 mr-0.5" />
                    Member
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Scope Navigation Switcher */}
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
          All Community Guilds
          {referenceList.length > 0 && (
            <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-muted font-bold text-muted-foreground">
              {referenceList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setScope("my-guilds")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            scope === "my-guilds"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/40"
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          My Guilds & Memberships
          {myGuildsCount > 0 && (
            <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
              {myGuildsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setScope("managed")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            scope === "managed"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/40"
          }`}
        >
          <Crown className="h-4 w-4 text-amber-500" />
          Guilds I Steward (Admin)
          {managedCount > 0 && (
            <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
              {managedCount}
            </span>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search guilds, cooperatives, or hubs..."
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Guild Grid */}
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
      ) : filteredOrgs.length === 0 ? (
        <div className="py-16 text-center border rounded-3xl bg-card/60 space-y-4">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold">
              {scope === "my-guilds"
                ? "You haven't joined any guilds yet"
                : scope === "managed"
                ? "You are not an admin of any guilds yet"
                : "No organizations match your query"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {scope === "my-guilds"
                ? "Explore all registered guilds and join a community to participate in gatherings and programs."
                : scope === "managed"
                ? "Create a new organization to establish a community treasury and host ticketed events."
                : "Try a different search term or register a new collective."}
            </p>
          </div>
          <div className="flex justify-center gap-3">
            {scope !== "all" && (
              <Button variant="outline" onClick={() => setScope("all")} className="rounded-xl">
                Browse All Guilds
              </Button>
            )}
            <Button onClick={() => setCreateOpen(true)} className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              Establish Guild
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map((org) => {
            const citizenCount = org._count?.members ?? org.memberCount ?? 0;
            const eventCount = org._count?.events ?? 0;
            const programCount = org._count?.programs ?? 0;

            return (
              <Card
                key={org.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border bg-card transition-all hover:shadow-xl hover:border-emerald-500/40"
              >
                <div>
                  {/* Banner & Logo */}
                  <div className="relative h-28 w-full bg-gradient-to-r from-emerald-600/20 via-primary/20 to-amber-500/20">
                    {org.bannerUrl && (
                      <Image
                        src={org.bannerUrl}
                        alt={`${org.name} Banner`}
                        fill
                        className="object-cover"
                      />
                    )}
                    <div className="absolute -bottom-6 left-5">
                      <div className="size-14 rounded-2xl border-4 border-card bg-card shadow-md overflow-hidden relative flex items-center justify-center font-black text-primary text-base">
                        {org.logoUrl ? (
                          <Image src={org.logoUrl} alt={org.name} fill className="object-cover" />
                        ) : (
                          org.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {org.isAdmin ? (
                        <Badge className="bg-amber-500/90 text-white backdrop-blur border-none font-bold text-[10px] gap-1 shadow-xs">
                          <Crown className="size-3" />
                          Steward / Admin
                        </Badge>
                      ) : org.isMember ? (
                        <Badge className="bg-primary/90 text-primary-foreground backdrop-blur border-none font-bold text-[10px] gap-1 shadow-xs">
                          <ShieldCheck className="size-3" />
                          Member
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="pt-8 px-5 pb-2 space-y-3">
                    <div>
                      <Link href={`/organization/${org.id}`}>
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                          {org.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {org.description || "Autonomous civic cooperative registered on CommunityOS."}
                      </p>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-center">
                      <div className="p-2 rounded-xl bg-muted/40">
                        <div className="text-sm font-black">{citizenCount}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold">Citizens</div>
                      </div>
                      <div className="p-2 rounded-xl bg-muted/40">
                        <div className="text-sm font-black">{eventCount}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold">Events</div>
                      </div>
                      <div className="p-2 rounded-xl bg-muted/40">
                        <div className="text-sm font-black">{programCount}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold">Programs</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-3 border-t border-border/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" className="w-full rounded-xl font-bold text-xs gap-1.5 shadow-xs">
                      <Link href={`/organization/${org.id}`}>
                        Enter Guild
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                    {org.isAdmin && (
                      <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-semibold px-2.5">
                        <Link href={`/wallet?organizationId=${org.id}`} title="Guild Treasury">
                          <Coins className="size-3.5 text-amber-500" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
