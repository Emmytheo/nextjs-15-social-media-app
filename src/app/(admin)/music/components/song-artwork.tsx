"use client";

import Image from "next/image";
import Link from "next/link";
import { FileText, Play, Heart, Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Song, Playlist, Like } from "@prisma/client";
import { toggleSongLike, addToPlaylist } from "../actions";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { SongActions } from "./SongActions";

interface SongArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
  song: Song & { likes: Like[]; coverUrl?: string | null; sheetMusicUrl?: string | null };
  aspectRatio?: "portrait" | "square";
  width?: number;
  height?: number;
  playlists?: Playlist[];
  currentUserId?: string | null; // Allow null for public mode
}

export function SongArtwork({
  song,
  aspectRatio = "portrait",
  width,
  height,
  className,
  playlists = [],
  currentUserId,
  ...props
}: SongArtworkProps) {
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(
    currentUserId ? song.likes.some((like) => like.userId === currentUserId) : false
  );

  // Determine if in public mode (no auth)
  const isPublicMode = !currentUserId;

  async function handleLike() {
    if (isPublicMode) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like songs",
      });
      return;
    }

    try {
      setIsLiked(!isLiked); // Optimistic update
      await toggleSongLike(song.id);
    } catch (error) {
      setIsLiked(!isLiked); // Revert on error
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update like status",
      });
    }
  }

  async function handleAddToPlaylist(playlistId: string) {
    if (isPublicMode) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add songs to playlists",
      });
      return;
    }

    const result = await addToPlaylist(playlistId, song.id);
    if (result.success) {
      toast({
        title: "Success",
        description: "Song added to playlist",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Failed to add to playlist",
      });
    }
  }

  const viewDetailsLink = isPublicMode ? `/preview/${song.id}` : `/music/${song.id}`;

  return (
    <div className={cn("space-y-3", className)} {...props}>
      <ContextMenu>
        <ContextMenuTrigger className="w-full">
          <div className="overflow-hidden rounded-md relative group card shadow-md">
            {song.coverUrl ? (
              <Image
                src={song.coverUrl}
                alt={song.title}
                width={width}
                height={height}
                className={cn(
                  "h-auto w-auto object-cover transition-all hover:scale-105",
                  aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
                )}
              />
            ) : (
              <div
                className={cn(
                  "bg-card dark:bg-muted flex items-center justify-center text-muted-foreground relative overflow-hidden",
                  aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square",
                  width ? `w-[${width}px]` : "w-full"
                )}
              >
                <div className="absolute inset-4 border-2 border-dashed border-muted-foreground/20 rounded-sm flex flex-col items-center justify-center opacity-50">
                  <div className="w-1/3 h-1/2 bg-muted-foreground/20 rounded-sm mb-2" />
                  <div className="w-1/4 h-[8%] bg-muted-foreground/20 rounded-full mb-1" />
                  <div className="w-1/5 h-[8%] bg-muted-foreground/20 rounded-full" />
                </div>
                <FileText className="h-10 w-10 z-10 opacity-50" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 gap-2">
              <Link href={viewDetailsLink}>
                <div className="bg-primary text-primary-foreground rounded-full p-3 cursor-pointer hover:scale-110 transition-transform">
                  <Play className="fill-current h-6 w-6" />
                </div>
              </Link>
              {isPublicMode ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike();
                        }}
                        className="bg-secondary text-secondary-foreground rounded-full p-3 cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Heart className="h-6 w-6" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sign in to like</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike();
                  }}
                  className="bg-secondary text-secondary-foreground rounded-full p-3 cursor-pointer hover:scale-110 transition-transform"
                >
                  <Heart className={cn("h-6 w-6", isLiked ? "fill-red-500 text-red-500" : "")} />
                </div>
              )}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-40">
          {isPublicMode ? (
            <>
              <ContextMenuItem disabled>Like (sign in required)</ContextMenuItem>
              <ContextMenuItem disabled>Add to Playlist (sign in required)</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>
                <Link href={viewDetailsLink} className="w-full">View Details</Link>
              </ContextMenuItem>
            </>
          ) : (
            <>
              <ContextMenuItem onClick={handleLike}>
                {isLiked ? "Unlike" : "Like"}
              </ContextMenuItem>
              <ContextMenuSub>
                <ContextMenuSubTrigger>Add to Playlist</ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-48">
                  {playlists.map(playlist => (
                    <ContextMenuItem key={playlist.id} onClick={() => handleAddToPlaylist(playlist.id)}>
                      {playlist.name}
                    </ContextMenuItem>
                  ))}
                  {playlists.length === 0 && (
                    <ContextMenuItem disabled>No playlists</ContextMenuItem>
                  )}
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSeparator />
              <ContextMenuItem>
                <Link href={viewDetailsLink} className="w-full">View Details</Link>
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
      <div className="space-y-1 text-sm flex justify-between items-start w-full">
        <div className="truncate">
          <h3 className="font-medium leading-none truncate">{song.title}</h3>
          <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
        </div>
        {!isPublicMode && <SongActions song={song} />}
      </div>
    </div>
  )
}
