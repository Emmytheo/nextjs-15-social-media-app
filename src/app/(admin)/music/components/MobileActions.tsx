"use client";

import { useState } from "react";
import { Plus, Music, ListMusic, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddSongDialog } from "./AddSongDialog";
import { PlaylistDialog } from "./playlist-dialog";

interface MobileActionsProps {
  isAdmin: boolean;
}

export function MobileActions({ isAdmin }: MobileActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-6 z-50 md:hidden flex flex-col items-end gap-4">
      {open && (
        <div className="flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {isAdmin && (
            <AddSongDialog>
              <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
                <Music className="h-5 w-5" />
                <span className="sr-only">Add Song</span>
              </Button>
            </AddSongDialog>
          )}
          <PlaylistDialog>
            <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
              <ListMusic className="h-5 w-5" />
              <span className="sr-only">Create Playlist</span>
            </Button>
          </PlaylistDialog>
        </div>
      )}
      
      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-transform duration-200",
          open && "rotate-45"
        )}
        onClick={() => setOpen(!open)}
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Toggle Actions</span>
      </Button>
    </div>
  );
}
