import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PlatformStatCards } from "./PlatformStatCards";
import { CommunitiesTable, CommunityRow } from "./CommunitiesTable";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "date-fns";
import {
  AlertCircle,
  ArrowRight,
  Coins,
  Crown,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  Building2,
  Calendar,
  Ticket,
  Folder,
  Landmark,
  Compass,
  CheckCircle2,
  ExternalLink,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardPageProps {
  searchParams?: Promise<{ scope?: string }>;
}

export default async function Page({ searchParams }: DashboardPageProps) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentScope = resolvedSearchParams.scope || "stewardship";

  const [
    orgCount,
    userCount,
    eventCount,
    postCount,
    rawOrganizations,
    pendingMilestones,
    userWallet,
    userMemberships,
    userRsvps,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.event.count(),
    prisma.post.count(),
    prisma.organization.findMany({
      include: {
        admins: {
          where: { userId: user.id },
          select: { userId: true },
        },
        members: {
          where: { userId: user.id },
          select: { userId: true },
        },
        _count: {
          select: {
            members: true,
            events: true,
            programs: true,
            highlights: true,
            activities: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.campaignMilestone.findMany({
      where: {
        status: "SUBMITTED",
        campaign: {
          organization: {
            admins: { some: { userId: user.id } },
          },
        },
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            organizationId: true,
            organization: { select: { name: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.wallet.findUnique({
      where: { userId: user.id },
    }),
    prisma.organizationMember.findMany({
      where: { userId: user.id },
      include: {
        organization: {
          include: {
            _count: {
              select: { members: true, events: true, programs: true },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    }),
    prisma.eventAttendee.findMany({
      where: { userId: user.id },
      include: {
        event: {
          include: {
            organization: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { event: { startDate: "asc" } },
      take: 6,
    }),
  ]);

  // Format data with role scoping
  const organizations: CommunityRow[] = rawOrganizations.map((org) => ({
    id: org.id,
    name: org.name,
    description: org.description,
    logoUrl: org.logoUrl,
    createdAt: org.createdAt,
    userRole: org.admins.length > 0 ? "ADMIN" : org.members.length > 0 ? "MEMBER" : null,
    _count: org._count,
  }));

  const managedOrgs = organizations.filter((o) => o.userRole === "ADMIN");
  const managedSidebarList = managedOrgs.map((o) => ({
    id: o.id,
    name: o.name,
    logoUrl: o.logoUrl,
  }));

  const totalCitizensInMyGuilds = managedOrgs.reduce((acc, o) => acc + o._count.members, 0);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" managedCommunities={managedSidebarList} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 py-4 md:py-6">
            {/* Header Greeting & Scope Switcher */}
            <div className="px-4 lg:px-6 space-y-4">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/15 via-primary/5 to-amber-500/10 border border-border/80 p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        Platform Console
                      </span>
                      <Badge variant="outline" className="text-[10px] gap-1 font-bold">
                        <Sparkles className="size-3 text-amber-500" />
                        MFB Core
                      </Badge>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Welcome back, {user.displayName}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {managedOrgs.length > 0 ? (
                        <>
                          You are commanding{" "}
                          <span className="font-semibold text-foreground">
                            {managedOrgs.length} community guild{managedOrgs.length !== 1 ? "s" : ""}
                          </span>{" "}
                          with{" "}
                          <span className="font-semibold text-foreground">
                            {totalCitizensInMyGuilds.toLocaleString()} citizen
                            {totalCitizensInMyGuilds !== 1 ? "s" : ""}
                          </span>{" "}
                          under your stewardship.
                        </>
                      ) : (
                        "Manage your citizen activities, event passes, and community guilds in one multi-scoped cockpit."
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    <Button asChild size="sm" className="gap-1.5 rounded-xl font-bold shadow-sm">
                      <Link href="/organization">
                        <Plus className="size-4" />
                        Create New Guild
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-xl font-semibold">
                      <Link href="/wallet">
                        <Coins className="size-4 text-amber-500" />
                        Fintech Vault
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Multi-Scope Navigation Switcher */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-muted/50 border border-border/60">
                <Button
                  asChild
                  variant={currentScope === "stewardship" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-2"
                >
                  <Link href="/dashboard?scope=stewardship">
                    <Crown className="size-3.5 text-amber-400" />
                    Guild Stewardship Scope ({managedOrgs.length})
                  </Link>
                </Button>

                <Button
                  asChild
                  variant={currentScope === "citizen" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-2"
                >
                  <Link href="/dashboard?scope=citizen">
                    <ShieldCheck className="size-3.5 text-primary" />
                    Citizen Hub Scope
                  </Link>
                </Button>

                <Button
                  asChild
                  variant={currentScope === "ecosystem" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-2"
                >
                  <Link href="/dashboard?scope=ecosystem">
                    <Compass className="size-3.5 text-indigo-500" />
                    Ecosystem Directory ({orgCount})
                  </Link>
                </Button>
              </div>
            </div>

            {/* Pending Approvals Alert Bar (Visible across scopes when there are submissions) */}
            {pendingMilestones.length > 0 && (
              <div className="px-4 lg:px-6">
                <Card className="border-amber-500/30 bg-amber-500/10 rounded-2xl">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
                        <AlertCircle className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {pendingMilestones.length} Milestone Proof Submission
                          {pendingMilestones.length !== 1 ? "s" : ""} Awaiting Review
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Campaign organizers in your managed communities have submitted proof of work for escrow tranche release.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {pendingMilestones[0].campaign.organizationId && (
                        <Button asChild size="sm" className="rounded-xl text-xs font-bold gap-1 bg-amber-600 hover:bg-amber-700 text-white">
                          <Link href={`/dashboard/organization/${pendingMilestones[0].campaign.organizationId}/treasury`}>
                            Review in Treasury
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* SCOPE 1: GUILD STEWARDSHIP CONSOLE */}
            {currentScope === "stewardship" && (
              <div className="px-4 lg:px-6 space-y-6">
                <div>
                  <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                    <Crown className="size-4 text-amber-500" />
                    Managed Guilds Command Center
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Direct administrative cockpit for your chartered institutions, member registries, and treasuries.
                  </p>
                </div>

                {managedOrgs.length === 0 ? (
                  <Card className="p-8 text-center rounded-3xl bg-card/60 border border-dashed space-y-3">
                    <Building2 className="size-10 mx-auto text-muted-foreground opacity-30" />
                    <h3 className="text-base font-bold">No Guilds Currently Stewarded</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      You are not currently an administrator of any organizations. Found your own collective to issue tokens, host ticketed events, and manage treasury escrow.
                    </p>
                    <Button asChild size="sm" className="rounded-xl font-bold gap-1.5">
                      <Link href="/organization">
                        <Plus className="size-4" />
                        Charter New Guild
                      </Link>
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {managedOrgs.map((org) => (
                      <Card
                        key={org.id}
                        className="group overflow-hidden rounded-3xl border bg-card p-5 transition-all hover:shadow-lg hover:border-amber-500/40 flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="size-12 rounded-2xl bg-amber-500/10 border flex items-center justify-center font-black text-amber-600 shrink-0 overflow-hidden relative">
                              {org.logoUrl ? (
                                <Image src={org.logoUrl} alt={org.name} fill className="object-cover" />
                              ) : (
                                org.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] font-bold px-1.5 py-0 mb-1">
                                STEWARD ROLE
                              </Badge>
                              <h3 className="font-bold text-base leading-tight truncate group-hover:text-primary transition-colors">
                                {org.name}
                              </h3>
                            </div>
                          </div>

                          {org.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {org.description}
                            </p>
                          )}

                          <div className="grid grid-cols-3 gap-2 pt-2 border-t text-center">
                            <div className="p-2 rounded-xl bg-muted/40">
                              <div className="text-sm font-black">{org._count.members}</div>
                              <div className="text-[10px] text-muted-foreground font-semibold">Citizens</div>
                            </div>
                            <div className="p-2 rounded-xl bg-muted/40">
                              <div className="text-sm font-black">{org._count.events}</div>
                              <div className="text-[10px] text-muted-foreground font-semibold">Events</div>
                            </div>
                            <div className="p-2 rounded-xl bg-muted/40">
                              <div className="text-sm font-black">{org._count.programs}</div>
                              <div className="text-[10px] text-muted-foreground font-semibold">Programs</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-4 mt-4 border-t">
                          <div className="grid grid-cols-2 gap-2">
                            <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-semibold h-8">
                              <Link href={`/organization/${org.id}`}>
                                Org Space
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-semibold h-8">
                              <Link href={`/wallet?organizationId=${org.id}`}>
                                <Coins className="size-3.5 mr-1 text-amber-500" />
                                Treasury
                              </Link>
                            </Button>
                          </div>
                          <Button asChild size="sm" className="rounded-xl text-xs font-bold h-8 bg-primary text-primary-foreground hover:bg-primary/90">
                            <Link href={`/events/create?organizationId=${org.id}`}>
                              <Plus className="size-3.5 mr-1" />
                              Host Event for Guild
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SCOPE 2: CITIZEN HUB WORKSPACE */}
            {currentScope === "citizen" && (
              <div className="px-4 lg:px-6 space-y-6">
                <div>
                  <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary" />
                    Personal Citizen Workspace
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your personal vault holdings, registered community memberships, and event passbook.
                  </p>
                </div>

                {/* Citizen Quick Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4 sm:p-5 rounded-2xl border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-muted-foreground">Available Vault Funds</span>
                      <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <Coins className="size-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black tracking-tight">
                      ${userWallet?.balance.toFixed(2) || "0.00"}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">Instant P2P liquid balance</div>
                  </Card>

                  <Card className="p-4 sm:p-5 rounded-2xl border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-muted-foreground">Escrow Commitments</span>
                      <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <Lock className="size-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black tracking-tight">
                      ${userWallet?.escrowBalance.toFixed(2) || "0.00"}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">Locked in campaign milestones</div>
                  </Card>

                  <Card className="p-4 sm:p-5 rounded-2xl border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-muted-foreground">Guild Memberships</span>
                      <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Users className="size-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black tracking-tight">
                      {userMemberships.length}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">Communities joined</div>
                  </Card>

                  <Card className="p-4 sm:p-5 rounded-2xl border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-muted-foreground">Gathering Passes</span>
                      <div className="size-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                        <Ticket className="size-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black tracking-tight">
                      {userRsvps.length}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">Upcoming event reservations</div>
                  </Card>
                </div>

                {/* Split section: Memberships & Upcoming Passes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Guild Memberships */}
                  <Card className="p-5 rounded-3xl border bg-card space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base flex items-center gap-2">
                        <Building2 className="size-4 text-primary" />
                        My Guild Memberships
                      </h3>
                      <Button asChild size="sm" variant="ghost" className="text-xs">
                        <Link href="/organization">Explore All</Link>
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {userMemberships.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4 text-center">
                          You haven&apos;t joined any community guilds yet.
                        </p>
                      ) : (
                        userMemberships.map((m) => (
                          <div
                            key={m.organization.id}
                            className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/50"
                          >
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-sm truncate">{m.organization.name}</h4>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                                <span>{m.organization._count.members} citizens</span>
                                <span>•</span>
                                <span>{m.organization._count.events} gatherings</span>
                              </div>
                            </div>
                            <Button asChild size="sm" variant="outline" className="rounded-xl text-xs h-7 ml-3">
                              <Link href={`/organization/${m.organization.id}`}>
                                Visit
                              </Link>
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>

                  {/* Registered Gathering Passes */}
                  <Card className="p-5 rounded-3xl border bg-card space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base flex items-center gap-2">
                        <Ticket className="size-4 text-emerald-500" />
                        My Event Passes & RSVPs
                      </h3>
                      <Button asChild size="sm" variant="ghost" className="text-xs">
                        <Link href="/events?scope=attending">View All Passes</Link>
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {userRsvps.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4 text-center">
                          No event registrations found. Browse the gatherings directory to RSVP.
                        </p>
                      ) : (
                        userRsvps.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/50"
                          >
                            <div className="min-w-0 flex-1">
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-bold px-1.5 py-0 mb-1">
                                {att.status}
                              </Badge>
                              <h4 className="font-bold text-sm truncate">{att.event.title}</h4>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <Calendar className="size-3 text-primary" />
                                <span>{formatDate(new Date(att.event.startDate), "MMM d, yyyy")}</span>
                                <span>•</span>
                                <span className="truncate">{att.event.organization?.name}</span>
                              </div>
                            </div>
                            <Button asChild size="sm" variant="outline" className="rounded-xl text-xs h-7 ml-3">
                              <Link href={`/events/${att.event.id}`}>
                                Ticket Pass
                              </Link>
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* SCOPE 3: PLATFORM ECOSYSTEM DIRECTORY & METRICS */}
            {currentScope === "ecosystem" && (
              <>
                {/* Platform Metrics */}
                <PlatformStatCards
                  orgCount={orgCount}
                  userCount={userCount}
                  eventCount={eventCount}
                  postCount={postCount}
                />

                {/* Scoped Directory Table */}
                <CommunitiesTable
                  data={organizations}
                  hasManagedOrgs={managedOrgs.length > 0}
                />
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
