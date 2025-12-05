import { Metadata } from "next";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getSongs } from "../actions";
import { SongArtwork } from "../components/song-artwork";

export const metadata: Metadata = {
  title: "My Library",
};

export const dynamic = "force-dynamic";

export default async function MusicLibraryPage() {
  const songs = await getSongs();

  return (
    <div className="border-t">
      <div className="bg-background">
        <div className="grid">
          <div className="col-span-3 lg:col-span-4 lg:border-l">
            <div className="h-full px-4 py-6 lg:px-8">
              <div className="mt-6 space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Library
                </h2>
                <p className="text-sm text-muted-foreground">
                  Browse all songs in the collection.
                </p>
              </div>
              <Separator className="my-4" />
              <div className="relative">
                <ScrollArea>
                  <div className="grid grid-cols-2 gap-4 pb-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {songs.map((song) => (
                      <SongArtwork
                        key={song.id}
                        song={song}
                        className="flex flex-col items-start justify-center p-2"
                        aspectRatio="square"
                        // width={180}
                        height={180}
                      />
                    ))}
                    {songs.length === 0 && (
                      <div className="col-span-full flex items-center justify-center h-32 text-muted-foreground">
                        No songs found in the library.
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
