import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Settings2,
  Eye,
  Edit,
  ImageIcon,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "date-fns";
import { EventStatusSwitcher } from "./EventStatusSwitcher";

interface PageProps {
  params: Promise<{ "event-id": string }>;
}

const statusConfig = {
  DRAFT: {
    label: "Draft",
    icon: AlertCircle,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300",
  },
  PUBLISHED: {
    label: "Published",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
  },
};

const attendeeStatusConfig = {
  CONFIRMED: { label: "Confirmed", className: "bg-green-100 text-green-800" },
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800" },
  WAITLISTED: { label: "Waitlisted", className: "bg-purple-100 text-purple-800" },
};

export default async function ManageEventPage({ params }: PageProps) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const { "event-id": eventId } = await params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organization: {
        include: {
          admins: { where: { userId: user.id } },
          members: { where: { userId: user.id } },
        },
      },
      _count: {
        select: { attendees: true, activities: true, gallery: true },
      },
      attendees: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              email: true,
            },
          },
        },
        orderBy: { registeredAt: "desc" },
      },
    },
  });

  if (!event) notFound();

  const isAdmin = event.organization.admins.length > 0;

  if (!isAdmin) {
    redirect(`/events/${eventId}`);
  }

  const status = event.status as keyof typeof statusConfig;
  const StatusIcon = statusConfig[status]?.icon ?? AlertCircle;

  const stats = [
    {
      label: "Total Attendees",
      value: event._count.attendees,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Activities",
      value: event._count.activities,
      icon: Activity,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950",
    },
    {
      label: "Gallery Items",
      value: event._count.gallery,
      icon: ImageIcon,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950",
    },
  ];

  return (
    <div className="w-full min-w-0 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href={`/events/${eventId}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Event
          </Link>
        </Button>
      </div>

      {/* Event Hero Header */}
      <Card className="overflow-hidden shadow-sm">
        <div className="relative h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-muted">
          {event.coverPhotoUrl && (
            <Image
              src={event.coverPhotoUrl}
              alt={event.title}
              fill
              className="object-cover opacity-40"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        </div>
        <CardContent className="relative -mt-8 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl border-4 border-card bg-primary/10 text-primary shadow-sm">
              <Calendar className="size-8" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl font-bold truncate">{event.title}</h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig[status]?.className ?? ""}`}
                >
                  <StatusIcon className="size-3.5" />
                  {statusConfig[status]?.label ?? event.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {formatDate(event.startDate, "PPP")}
                  {event.endDate && ` → ${formatDate(event.endDate, "PPP")}`}
                </span>
                {event.venue && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {event.venue}
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href={`/events/${eventId}`}>
            <Eye className="size-4" />
            View Public Page
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href={`/events/${eventId}/edit`}>
            <Edit className="size-4" />
            Edit Event Details
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href={`/organization/${event.organization.id}`}>
            <Users className="size-4" />
            Community Profile
          </Link>
        </Button>
      </div>

      {/* Status Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="size-4" />
            Event Status Control
          </CardTitle>
          <CardDescription>
            Control visibility and lifecycle status of this event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventStatusSwitcher
            eventId={eventId}
            currentStatus={event.status}
            isPublished={event.isPublished}
          />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`flex size-12 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`size-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendee Roster */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Registered Attendees
              </CardTitle>
              <CardDescription>
                {event._count.attendees} citizen{event._count.attendees !== 1 ? "s" : ""} registered for this event.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {event.attendees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Users className="size-12 mb-3 opacity-20" />
              <p className="font-medium">No attendees yet</p>
              <p className="text-sm mt-1">Share the event page to start getting RSVPs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>RSVP Date</TableHead>
                    <TableHead>Ticket Code</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {event.attendees.map((attendee) => {
                    const attendeeStatus = attendee.status as keyof typeof attendeeStatusConfig;
                    const statusStyle = attendeeStatusConfig[attendeeStatus] ?? {
                      label: attendee.status,
                      className: "bg-muted text-muted-foreground",
                    };
                    return (
                      <TableRow key={attendee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarImage
                                src={attendee.user.avatarUrl ?? undefined}
                                alt={attendee.user.displayName}
                              />
                              <AvatarFallback className="text-xs">
                                {attendee.user.displayName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <Link
                              href={`/users/${attendee.user.username}`}
                              className="font-medium hover:underline text-sm"
                            >
                              {attendee.user.displayName}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          @{attendee.user.username}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {attendee.user.email ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(attendee.registeredAt, "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {attendee.ticketCode ? (
                            <span className="inline-flex items-center gap-1 font-mono text-xs bg-muted px-2 py-0.5 rounded">
                              <Ticket className="size-3" />
                              {attendee.ticketCode}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle.className}`}
                          >
                            {statusStyle.label}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
