import Link from "next/link";
import { ListMusic } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlaylistsTabProps {
  playlists: any[]; // Replace with proper type if available
}

export function PlaylistsTab({ playlists }: PlaylistsTabProps) {
  if (playlists.length === 0) {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <ListMusic className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No playlists created</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            You haven&apos;t created any playlists yet. Create one to organize your favorite songs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {playlists.map((playlist) => (
        <Link
          key={playlist.id}
          href={`/music/playlists/${playlist.id}`}
          className="group relative flex flex-col gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
        >
          <div className="aspect-square w-full overflow-hidden rounded-md bg-muted relative">
             <div className="flex h-full w-full items-center justify-center bg-secondary/50">
                <ListMusic className="h-10 w-10 text-muted-foreground" />
             </div>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold leading-none truncate">{playlist.name}</h3>
            <p className="text-xs text-muted-foreground">
              {playlist._count.songs} songs
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
