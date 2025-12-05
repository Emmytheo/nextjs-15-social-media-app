"use client";

import { OrganizationWithCounts } from "../page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateOrganizationActivityForm } from "../CreateOrganizationActivityForm";
import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "date-fns";
import { Calendar, Camera, MapPin, Users, Loader2 } from "lucide-react";

interface ActivitiesTabProps {
  organization: OrganizationWithCounts;
  isAdmin?: boolean;
}

interface OrganizationActivityData {
  id: string;
  title: string;
  description: string | null;
  type: string;
  startDate: Date | null;
  endDate: Date | null;
  location: string | null;
  capacity: number | null;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  _count: {
    participants: number;
  };
  organizationProgram: {
    id: string;
    title: string;
  } | null;
}

interface ActivitiesPage {
  activities: OrganizationActivityData[];
  nextCursor: string | null;
}

export function ActivitiesTab({ organization, isAdmin }: ActivitiesTabProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["organization-activities", organization.id],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/organizations/${organization.id}/activities`,
          pageParam ? { searchParams: { cursor: String(pageParam) } } : undefined
        )
        .json<ActivitiesPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const activities = data?.pages.flatMap((page) => page.activities) || [];

  if (status === "pending") {
    return (
      <div className="rounded-2xl bg-card p-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Activities
          </h3>
          {isAdmin && <CreateOrganizationActivityForm organizationId={organization.id} />}
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Activities
        </h3>
        {isAdmin && <CreateOrganizationActivityForm organizationId={organization.id} />}
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          {activities.length > 0 ? (
            <InfiniteScrollContainer
              className="space-y-5"
              onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
            >
              {activities.map((activity, index) => (
                <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg leading-tight">{activity.title}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {activity.type}
                          </Badge>
                          {activity.organizationProgram && (
                            <Badge variant="outline" className="text-xs">
                              Prog: {activity.organizationProgram.title}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={activity.user.avatarUrl || undefined} />
                              <AvatarFallback className="text-xs">
                                {activity.user.displayName.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{activity.user.displayName}</span>
                          </div>
                          <span>•</span>
                          <span>{formatDate(activity.createdAt, "MMM d, yyyy")}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {activity._count.participants}
                          </div>
                        </div>
                        {activity.startDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(activity.startDate, "MMM d, yyyy")}
                            {activity.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {activity.endDate && ` - ${activity.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </div>
                        )}
                        {activity.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3" />
                            {activity.location}
                          </div>
                        )}
                        {activity.capacity && (
                          <Badge variant="outline" className="text-xs">
                            Capacity: {activity.capacity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <Button variant="ghost" size="sm">
                        Join Activity
                      </Button>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
            </InfiniteScrollContainer>
          ) : (
            <Card className="p-8 text-center">
              <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No activities yet</h3>
              <p className="text-muted-foreground mb-4">
                Activities will showcase events, workshops, and gatherings organized by {organization.name}.
              </p>
              <CreateOrganizationActivityForm organizationId={organization.id} />
            </Card>
          )}
        </div>
      </div>
    </div >
  );
}
