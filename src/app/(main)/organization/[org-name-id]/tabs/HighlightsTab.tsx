"use client";

import { useQuery } from "@tanstack/react-query";
import ky from "@/lib/ky";
import { OrganizationWithCounts } from "../page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Heart, Calendar, Users, TrendingUp, Book, Award, Plus, Loader2 } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import kyInstance from "@/lib/ky";
import { formatDate } from "date-fns";
import { CreateOrganizationHighlightForm } from "../CreateOrganizationHighlightForm";

interface HighlightsTabProps {
  organization: OrganizationWithCounts;
  isAdmin?: boolean;
}

// ... (OrganizationHighlightData interface remains same)

export function HighlightsTab({ organization, isAdmin }: HighlightsTabProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["organization-highlights", organization.id],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/organizations/${organization.id}/highlights`,
          pageParam ? { searchParams: { cursor: String(pageParam) } } : undefined
        )
        .json<HighlightsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const highlights = data?.pages.flatMap((page) => page.highlights) || [];

  if (status === "pending") {
    return (
      <div className="rounded-2xl bg-card p-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Star className="w-5 h-5" />
            Featured Content & Highlights
          </h3>
          <div className="flex items-center gap-2">
            {isAdmin && <CreateOrganizationHighlightForm organizationId={organization.id} />}
          </div>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card p-5">
      <div className="flex items-center justify-between mb-6 flex-wrap md:flex-nowrap gap-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Star className="w-5 h-5" />
          Featured Content & Highlights
        </h3>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            View All
          </Button>
          {isAdmin && <CreateOrganizationHighlightForm organizationId={organization.id} />}
        </div>
      </div>

      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Members", value: organization._count.members.toString(), icon: Users },
            { label: "Posts Created", value: organization._count.posts.toString(), icon: Book },
            { label: "Highlights", value: highlights.length.toString(), icon: Star },
            { label: "Events", value: organization.events?.length.toString() || "0", icon: Calendar }
          ].map((stat, index) => (
            <Card key={index} className="p-4 text-center">
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        <InfiniteScrollContainer
          className="space-y-5"
          onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
        >
          {highlights.length > 0 ? (
            highlights.map((highlight) => (
              <Card key={highlight.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg leading-tight">{highlight.title}</CardTitle>
                        {highlight.featured && (
                          <Badge variant="secondary" className="text-xs whitespace-nowrap">
                            ⭐ Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={highlight.user.avatarUrl || undefined} />
                            <AvatarFallback className="text-xs">
                              {highlight.user.displayName.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{highlight.user.displayName}</span>
                        </div>
                        <span>•</span>
                        <span>{formatDate(highlight.createdAt, "MMM d, yyyy")}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {highlight._count.likes}
                        </div>
                      </div>
                      {highlight.category && (
                        <Badge variant="outline" className="text-xs">
                          {highlight.category}
                        </Badge>
                      )}
                      {highlight.program && (
                        <Badge variant="outline" className="text-xs">
                          Prog: {highlight.program.title}
                        </Badge>
                      )}
                      {highlight.activity && (
                        <Badge variant="outline" className="text-xs">
                          Act: {highlight.activity.title}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {highlight.excerpt && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {highlight.excerpt}
                    </p>
                  )}
                  {highlight.attachments && highlight.attachments.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
                      {highlight.attachments.slice(0, 3).map((attachment, index) => (
                        <div key={attachment.id} className="aspect-video bg-muted rounded-lg overflow-hidden">
                          {/* Placeholder for image/video */}
                          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                            {attachment.type === 'IMAGE' ? '🖼️' : '🎥'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4 mr-2" />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm">
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No highlights yet</h3>
              <p className="text-muted-foreground mb-4">
                Highlights will showcase important stories, achievements, and updates from {organization.name}.
              </p>
              <CreateOrganizationHighlightForm organizationId={organization.id} />
            </Card>
          )}

          {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
        </InfiniteScrollContainer>
      </div>
    </div>
  );
}
