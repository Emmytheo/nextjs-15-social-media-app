import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Calendar,
  Star,
  BookOpen,
  Activity,
  ImageIcon,
  Plus,
  Eye,
  ArrowRight,
  ChartBar,
  AlertCircle,
  Coins,
  ShieldCheck,
  Globe,
  Settings,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "date-fns";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const { id } = await params;

  const [organization, pendingMilestonesCount] = await Promise.all([
    prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            members: true,
            events: true,
            highlights: true,
            programs: true,
            activities: true,
            gallery: true,
          },
        },
        crowdfundingCampaigns: {
          select: {
            id: true,
            raisedAmount: true,
            targetAmount: true,
          },
        },
        members: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true, avatarUrl: true },
            },
          },
          orderBy: { joinedAt: "desc" },
          take: 8,
        },
        admins: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true, avatarUrl: true },
            },
          },
        },
        events: {
          where: { startDate: { gte: new Date() } },
          orderBy: { startDate: "asc" },
          take: 4,
          include: {
            _count: { select: { attendees: true } },
          },
        },
        highlights: {
          orderBy: { createdAt: "desc" },
          take: 4,
          include: {
            user: {
              select: { username: true, displayName: true, avatarUrl: true },
            },
          },
        },
      },
    }),
    prisma.campaignMilestone.count({
      where: {
        campaign: { organizationId: id },
        status: "SUBMITTED",
      },
    }),
  ]);

  if (!organization) redirect("/");

  const adminIds = new Set(organization.admins.map((a) => a.userId));
  const isUserAdmin = adminIds.has(user.id);

  const totalRaised = organization.crowdfundingCampaigns.reduce(
    (sum, c) => sum + c.raisedAmount,
    0
  );

  const stats = [
    { title: "Citizens", value: organization._count.members, icon: Users, href: "members", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
    { title: "Events", value: organization._count.events, icon: Calendar, href: "events", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
    { title: "Treasury", value: `$${totalRaised.toLocaleString()}`, icon: ChartBar, href: "treasury", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
    { title: "Programs", value: organization._count.programs, icon: BookOpen, href: "programs", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
    { title: "Activities", value: organization._count.activities, icon: Activity, href: "activities", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950" },
    { title: "Highlights", value: organization._count.highlights, icon: Star, href: "highlights", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950" },
  ];

  const baseUrl = `/dashboard/organization/${id}`;

  return (
    <div className="space-y-6">
      {/* Pending Milestone Proof Submissions Alert (if any) */}
      {pendingMilestonesCount > 0 && isUserAdmin && (
        <Card className="border-amber-500/40 bg-amber-500/10">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
                <AlertCircle className="size-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {pendingMilestonesCount} Milestone Proof Submission{pendingMilestonesCount !== 1 ? "s" : ""} Awaiting Verification
                </p>
                <p className="text-xs text-muted-foreground">
                  Campaign organizers in {organization.name} have submitted proof of work for escrow tranche release.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="rounded-xl text-xs font-bold gap-1 bg-amber-600 hover:bg-amber-700 text-white shrink-0">
              <Link href={`${baseUrl}/treasury`}>
                Review in Treasury
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Hero Card */}
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <div className="relative h-32 sm:h-36 bg-gradient-to-r from-primary/30 via-primary/15 to-amber-500/15">
          {organization.bannerUrl && (
            <Image
              src={organization.bannerUrl}
              alt={`${organization.name} banner`}
              fill
              className="object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/40 to-transparent" />
        </div>
        <CardContent className="relative -mt-12 pb-5 px-5 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4 min-w-0">
              <div className="flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-primary/10 text-primary shadow-lg overflow-hidden relative">
                {organization.logoUrl ? (
                  <Image src={organization.logoUrl} alt={organization.name} width={96} height={96} className="object-cover size-full" />
                ) : (
                  <span className="text-3xl font-black text-primary">{organization.name.charAt(0)}</span>
                )}
              </div>
              <div className="space-y-1 min-w-0 pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold truncate text-foreground">{organization.name}</h1>
                  <Badge variant="outline" className="text-[10px] font-bold shrink-0">
                    {isUserAdmin ? "Admin Console" : "Member Portal"}
                  </Badge>
                </div>
                {organization.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{organization.description}</p>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 sm:pt-0">
              <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs font-semibold">
                <Link href={`/organization/${id}`}>
                  <Globe className="size-3.5 text-primary" />
                  Public Hub
                </Link>
              </Button>
              {isUserAdmin && (
                <>
                  <Button asChild size="sm" className="gap-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-sm">
                    <Link href={`/events/create?organizationId=${id}`}>
                      <Plus className="size-3.5" />
                      Host Event
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm" className="gap-1.5 rounded-xl text-xs font-semibold">
                    <Link href={`${baseUrl}/settings`}>
                      <Settings className="size-3.5" />
                      Settings
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={`${baseUrl}/${stat.href}`} className="group">
            <Card className="h-full hover:shadow-md transition-all hover:border-primary/30 bg-card">
              <CardContent className="pt-4 pb-3">
                <div className={`flex size-9 items-center justify-center rounded-xl ${stat.bg} mb-2`}>
                  <stat.icon className={`size-5 ${stat.color}`} />
                </div>
                <p className="text-xl sm:text-2xl font-extrabold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors font-medium">{stat.title}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Two Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2 font-bold">
              <Calendar className="size-4 text-emerald-500" />
              Scheduled Gatherings & Events
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs font-semibold">
              <Link href={`${baseUrl}/events`}>
                View all <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {organization.events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Calendar className="size-10 mb-2 opacity-20" />
                <p className="text-sm font-medium">No upcoming events scheduled</p>
                {isUserAdmin && (
                  <Button asChild size="sm" className="mt-3 gap-1 rounded-xl">
                    <Link href={`/events/create?organizationId=${id}`}>
                      <Plus className="size-3.5" /> Host an event
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {organization.events.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`} className="group flex items-center gap-3 rounded-xl p-2.5 hover:bg-muted/50 border border-transparent hover:border-border/60 transition-all">
                    <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                      <span>{formatDate(event.startDate, "MMM").toUpperCase()}</span>
                      <span className="text-sm leading-tight font-extrabold">{formatDate(event.startDate, "d")}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event._count.attendees} confirmed attendance</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Highlights */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2 font-bold">
              <Star className="size-4 text-amber-500" />
              Community Highlights
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs font-semibold">
              <Link href={`${baseUrl}/highlights`}>
                View all <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {organization.highlights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Star className="size-10 mb-2 opacity-20" />
                <p className="text-sm font-medium">No highlights posted yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {organization.highlights.map((h) => (
                  <Link key={h.id} href={`/organization/${id}/highlights/${h.id}`} className="group flex items-center gap-3 rounded-xl p-2.5 hover:bg-muted/50 border border-transparent hover:border-border/60 transition-all">
                    <Avatar className="size-8">
                      <AvatarImage src={h.user.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-xs font-bold">{h.user.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                        {(h as any).title ?? "Highlight"}
                      </p>
                      <p className="text-xs text-muted-foreground">by {h.user.displayName}</p>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">
                      {formatDate(h.createdAt, "MMM d")}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Community Members Ribbon */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2 font-bold">
            <Users className="size-4 text-blue-500" />
            Enrolled Citizens ({organization.members.length})
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs font-semibold">
            <Link href={`${baseUrl}/members`}>
              Manage all <ArrowRight className="size-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2.5">
            {organization.members.map((m) => (
              <Link
                key={m.userId}
                href={`/users/${m.user.username}`}
                className="group flex items-center gap-2 rounded-xl border px-3 py-1.5 hover:border-primary/50 hover:bg-muted/50 transition-all"
              >
                <Avatar className="size-6">
                  <AvatarImage src={m.user.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-xs font-bold">{m.user.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold group-hover:text-primary transition-colors">
                  {m.user.displayName}
                </span>
                {adminIds.has(m.userId) && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1 py-0 font-bold">
                    Admin
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
