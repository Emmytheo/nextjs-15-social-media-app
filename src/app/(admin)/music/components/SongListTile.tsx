"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, Music, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

interface SongListTileProps {
  song: {
    id: string;
    title: string;
    artist: string;
    genre?: string | null;
    coverUrl?: string | null;
    audioUrl?: string | null;
  };
  className?: string;
  showPlayer?: boolean;
  baseRoute?: string; // "/music" for admin, "/preview" for public
}

export function SongListTile({ song, className, showPlayer = false, baseRoute = "/music" }: SongListTileProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress(audio.currentTime);
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setProgress(value[0]);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2.5 rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:bg-accent/50",
        className
      )}
    >
      {/* Cover Image */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border">
        {song.coverUrl ? (
          <Image
            src={song.coverUrl}
            alt={song.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Music className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm truncate leading-none">{song.title}</h4>
          {song.genre && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              {song.genre}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
      </div>

      {/* Player Controls */}
      {showPlayer && song.audioUrl && (
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-[200px]">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>

          <div className="flex-1 flex flex-col gap-1">
            <Slider
              value={[progress]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <audio ref={audioRef} src={song.audioUrl} preload="metadata" />
        </div>
      )}

      {/* Actions */}
      <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
        <Link href={`${baseRoute}/${song.id}`}>
          <ExternalLink className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
