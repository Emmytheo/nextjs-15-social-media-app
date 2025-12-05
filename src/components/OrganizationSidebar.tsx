"use client";

import type {
  OrganizationWithCounts,
  OrganizationProfileProps,
} from "@/app/(main)/organization/[org-name-id]/page";
import { getOrganizationMembers } from "@/app/(main)/organization/[org-name-id]/tabs/MembersTab";
import { formatNumber } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import Link from "next/link";
import { useEffect } from "react";
import { Skeleton } from "./ui/skeleton";
import { getEvents } from "@/app/(main)/events/page";
import { Card } from "./ui/card";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { EventWithDetails } from "@/app/(main)/events/[event-id]/page";

interface OrganizationSidebarProps {
  organization: OrganizationWithCounts;
}

export function OrganizationSidebar({
  organization,
}: OrganizationSidebarProps) {
  const events = organization.events as EventWithDetails[];
  const { data: members, isLoading } = useQuery({
    queryKey: ["organization-members", organization.id],
    queryFn: () => getOrganizationMembers(organization.id),
  });

  // const {
  //   data: events,
  //   isLoading: isLoadingEvents,
  //   isError,
  // } = useQuery({
  //   queryKey: ["organization-events", organization.id],
  //   queryFn: () => getEvents({ organizationId }),
  // });

  useEffect(() => {
    // if (events) {
    console.log(organization.events);
    // }
  }, [organization]);

  return (
    <div className="hidden w-80 shrink-0 space-y-5 lg:block">
      <div className="rounded-2xl bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold">Organization Stats</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Posts:</span>
            <span className="font-medium">
              {formatNumber(organization._count.posts)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Members:</span>
            <span className="font-medium">
              {formatNumber(organization._count.members)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold">Top Members</h3>

        {!isLoading && members && members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member) => {
              return (
                <div
                  key={member.userId}
                  className="flex items-center justify-between"
                >
                  <Link
                    href={`/users/${member.user.username}`}
                    className="-m-2 flex w-fit flex-1 items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/50"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user.avatarUrl || undefined} />
                      <AvatarFallback>
                        {member.user.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {member.user.displayName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{member.user.username}
                      </p>
                    </div>
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    Joined {formatDate(member.joinedAt, "MMM d")}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full bg-muted" />
              <div>
                <Skeleton className="h-3 w-24 rounded bg-muted" />
                <Skeleton className="mt-1 h-2 w-16 rounded bg-muted" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full bg-muted" />
              <div>
                <Skeleton className="h-3 w-24 rounded bg-muted" />
                <Skeleton className="mt-1 h-2 w-16 rounded bg-muted" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold">Upcoming Events</h3>

        {events && events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="block group">
                <Card className="p-4 transition-colors group-hover:bg-muted/50">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={event.logoUrl || "/img/icon.png"}
                        alt={event.title}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="truncate text-sm font-semibold leading-tight group-hover:underline decoration-primary/50 underline-offset-4">
                        {event.title}
                      </h5>
                      <p className="mb-2 text-xs text-muted-foreground">
                        {new Date(event.startDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            event.status === "Full"
                              ? "secondary"
                              : event.status === "Upcoming"
                                ? "default"
                                : "outline"
                          }
                          className="text-xs capitalize"
                        >
                          {event.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          👥 {event.attendees ? event.attendees.length : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Placeholder for events */}
            <Skeleton className="h-16 rounded bg-muted" />
            <Skeleton className="h-16 rounded bg-muted" />
          </div>
        )}
      </div>
    </div>
  );
}
