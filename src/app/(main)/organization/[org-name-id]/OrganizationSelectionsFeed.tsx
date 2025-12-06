"use client";

import { OrganizationSelection } from "@prisma/client";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import kyInstance from "@/lib/ky";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Music, Play, Plus } from "lucide-react";

interface OrganizationSelectionsFeedProps {
  organization: {
    id: string;
    name: string;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    createdAt: Date;
  };
}

export interface OrganizationSelectionData {
  id: string;
  title: string;
  description: string | null;
  purpose: string | null;
  organizationId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  songs: Array<{
    song: {
      id: string;
      title: string;
      artist: string;
      genre: string | null;
      duration: number | null;
    };
    order: number;
  }>;
  _count: {
    songs: number;
  };
}

interface SelectionsPage {
  selections: OrganizationSelectionData[];
  nextCursor: string | null;
}

export function OrganizationSelectionsFeed({ organization }: OrganizationSelectionsFeedProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["organization-selections", organization.id],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/organizations/${organization.id}/selections`,
          pageParam ? { searchParams: { cursor: String(pageParam) } } : undefined
        )
        .json<SelectionsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const selections = data?.pages.flatMap((page) => page.selections) || [];
  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !selections.length && !hasNextPage) {
    return (
      <div className="rounded-2xl bg-card p-5 text-center">
        <div className="flex flex-col items-center gap-4">
          <Music className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No selections yet</h3>
          <p className="text-muted-foreground">
            Music selections will appear here when admins create them for your organization.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl bg-card p-5 text-center">
        <p className="text-destructive">
          An error occurred while loading selections.
        </p>
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5 mt-2"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {selections.map((selection) => (
        <Card key={selection.id} className="overflow-hidden text-xs md:text-sm p-0 md:p-2">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{selection.title}</CardTitle>
                {selection.purpose && (
                  <Badge variant="secondary" className="mt-1">
                    {selection.purpose}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {selection._count.songs} songs
              </div>
            </div>
            {selection.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {selection.description}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs md:text-sm">
              {selection.songs.slice(0, 3).map((songEntry, index) => (
                <div key={songEntry.song.id} className="flex items-center gap-3 p-2 rounded-lg border">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    <span className="text-xs md:text-sm font-medium">{songEntry.order}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{songEntry.song.title}</p>
                    <p className="text-xs text-muted-foreground">{songEntry.song.artist}</p>
                  </div>
                  {songEntry.song.duration && (
                    <div className="text-xs text-muted-foreground">
                      {Math.floor(songEntry.song.duration / 60)}:{(songEntry.song.duration % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
              ))}
              {selection.songs.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm">
                    View all {selection.songs.length} songs
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
