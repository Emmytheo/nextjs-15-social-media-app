import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Plus,
  Users,
  MapPin,
  Eye,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "date-fns";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusConfig = {
  DRAFT: { label: "Draft", icon: AlertCircle, className: "bg-yellow-100 text-yellow-800" },
  PUBLISHED: { label: "Published", icon: CheckCircle2, className: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelled", icon: XCircle, className: "bg-red-100 text-red-800" },
  COMPLETED: { label: "Completed", icon: Clock, className: "bg-blue-100 text-blue-800" },
};

export default async function OrgEventsPage({ params }: PageProps) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const { id } = await params;

  const organization = await prisma.organization.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!organization) redirect("/");

  const events = await prisma.event.findMany({
    where: { organizationId: id },
    include: {
      _count: { select: { attendees: true, activities: true } },
    },
    orderBy: { startDate: "desc" },
  });

  const upcoming = events.filter((e) => new Date(e.startDate) >= new Date());
  const past = events.filter((e) => new Date(e.startDate) < new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="size-6" />
            Community Events
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {events.length} event{events.length !== 1 ? "s" : ""} hosted by {organization.name}
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href={`/events/create?organizationId=${id}`}>
            <Plus className="size-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="size-14 mb-4 opacity-20" />
            <CardTitle className="text-xl mb-2">No events yet</CardTitle>
            <CardDescription className="mb-4">
              Host your first community event to start bringing people together.
            </CardDescription>
            <Button asChild>
              <Link href={`/events/create?organizationId=${id}`}>
                <Plus className="mr-2 size-4" />
                Create First Event
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                Upcoming ({upcoming.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcoming.map((event) => {
                  const status = event.status as keyof typeof statusConfig;
                  const cfg = statusConfig[status] ?? statusConfig.DRAFT;
                  const StatusIcon = cfg.icon;
                  return (
                    <Card key={event.id} className="hover:shadow-md transition-all hover:border-primary/30 overflow-hidden">
                      <div className="relative h-24 bg-gradient-to-r from-primary/20 to-muted overflow-hidden">
                        {event.coverPhotoUrl && (
                          <Image src={event.coverPhotoUrl} alt={event.title} fill className="object-cover opacity-60" />
                        )}
                        <div className="absolute top-2 right-2">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
                            <StatusIcon className="size-3" />
                            {cfg.label}
                          </span>
                        </div>
                        <div className="absolute bottom-2 left-3">
                          <span className="text-xs font-bold bg-background/90 rounded px-1.5 py-0.5">
                            {formatDate(event.startDate, "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      <CardContent className="pt-3 pb-4">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
                          {event.venue && (
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3" />{event.venue}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="size-3" />{event._count.attendees} attending
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm" className="h-7 text-xs gap-1 flex-1">
                            <Link href={`/events/${event.id}`}>
                              <Eye className="size-3" />View
                            </Link>
                          </Button>
                          <Button asChild size="sm" className="h-7 text-xs gap-1 flex-1">
                            <Link href={`/events/${event.id}/manage`}>
                              <LayoutDashboard className="size-3" />Manage
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section>
              <h2 className="text-base font-semibold mb-3 text-muted-foreground flex items-center gap-2">
                <Clock className="size-4" />
                Past Events ({past.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {past.map((event) => {
                  const status = event.status as keyof typeof statusConfig;
                  const cfg = statusConfig[status] ?? statusConfig.COMPLETED;
                  const StatusIcon = cfg.icon;
                  return (
                    <Card key={event.id} className="opacity-80 hover:opacity-100 transition-all">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                            <span>{formatDate(event.startDate, "MMM")}</span>
                            <span className="text-base leading-tight">{formatDate(event.startDate, "d")}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm truncate">{event.title}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium ${cfg.className}`}>
                                <StatusIcon className="size-3" />{cfg.label}
                              </span>
                              <span className="text-xs text-muted-foreground">{event._count.attendees} attended</span>
                            </div>
                          </div>
                          <Button asChild variant="ghost" size="sm" className="h-7 text-xs shrink-0">
                            <Link href={`/events/${event.id}`}>View</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
