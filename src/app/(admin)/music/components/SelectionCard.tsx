"use client";

import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SongListTile } from "./SongListTile";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface SelectionCardProps {
  selection: {
    id: string;
    title: string;
    description: string | null;
    songs: {
      song: {
        id: string;
        title: string;
        artist: string;
        genre: string | null;
        coverUrl: string | null;
        audioUrl: string | null;
      };
    }[];
  };
  baseRoute?: string; // "/music" for admin, "/preview" for public
}

export function SelectionCard({ selection, baseRoute = "/music" }: SelectionCardProps) {
  return (
    <div className="flex flex-col rounded-xl border bg-card text-card-foreground shadow">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold leading-none tracking-tight text-xl">
              {selection.title}
            </h3>
            {selection.description && (
              <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                {selection.description}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`${baseRoute}/selection/${selection.id}`} className="gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="p-3 md:p-6 pt-0">
        <ScrollArea className="h-[300px] pr-4 overflow-x-auto">
          <div className="space-y-2">
            {selection.songs.length > 0 ? (
              selection.songs.slice(0, 5).map(({ song }) => (
                <SongListTile key={song.id} song={song} baseRoute={baseRoute} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No songs in this selection.
              </p>
            )}
            {selection.songs.length > 5 && (
              <div className="pt-2 text-center">
                <Button variant="link" size="sm" asChild>
                  <Link href={`${baseRoute}/selection/${selection.id}`}>
                    +{selection.songs.length - 5} more songs
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
