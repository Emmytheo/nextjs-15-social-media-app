import { Metadata } from "next";
import Link from "next/link";
import { getPlaylists } from "../actions";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PlaylistDialog } from "../components/playlist-dialog";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Playlists",
};

export const dynamic = "force-dynamic";

export default async function PlaylistsPage() {
  const playlists = await getPlaylists();

  return (
    <div className="border-t">
      <div className="bg-background">
        <div className="grid">
          <div className="col-span-3 lg:col-span-4 lg:border-l">
            <div className="h-full px-4 py-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Playlists
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your personal music collections.
                  </p>
                </div>
                <PlaylistDialog />
              </div>
              <Separator className="my-4" />
              <div className="relative">
                <ScrollArea>
                  <div className="grid grid-cols-2 gap-4 pb-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {playlists.map((playlist) => (
                      <Link
                        key={playlist.id}
                        href={`/music/playlists/${playlist.id}`}
                        className="group relative flex flex-col gap-2 px-2"
                      >
                        <div className="overflow-hidden rounded-md bg-muted aspect-square flex items-center justify-center shadow-md">
                          {playlist.coverUrl ? (
                            <img
                              src={playlist.coverUrl}
                              alt={playlist.name}
                              className="h-full w-full object-cover transition-all hover:scale-105"
                            />
                          ) : (
                            <FileText className="h-10 w-10 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-1 text-sm">
                          <h3 className="font-medium leading-none truncate">
                            {playlist.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {playlist._count.songs} songs
                          </p>
                        </div>
                      </Link>
                    ))}
                    {playlists.length === 0 && (
                      <div className="col-span-full flex items-center justify-center h-32 text-muted-foreground">
                        No playlists found. Create one to get started!
                      </div>
                    )}
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
