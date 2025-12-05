import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { SongArtwork } from "../../components/song-artwork";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getPlaylists } from "../../actions";
import { validateRequest } from "@/auth";

interface PlaylistPageProps {
  params: {
    playlistId: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PlaylistPageProps): Promise<Metadata> {
  const playlist = await prisma.playlist.findUnique({
    where: { id: params.playlistId },
  });

  if (!playlist) {
    return {
      title: "Playlist Not Found",
    };
  }

  return {
    title: playlist.name,
    description: playlist.description || `Playlist by user`,
  };
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const playlist = await prisma.playlist.findUnique({
    where: { id: params.playlistId },
    include: {
      songs: {
        include: {
          song: {
            include: {
              likes: true,
            },
          },
        },
        orderBy: {
          addedAt: "asc",
        },
      },
    },
  });

  if (!playlist) {
    notFound();
  }

  const allPlaylists = await getPlaylists();
  const { user } = await validateRequest();

  return (
    <div className="border-t">
      <div className="bg-background">
        <div className="grid">
          <div className="col-span-3 lg:col-span-4 lg:border-l">
            <div className="h-full px-4 py-6 lg:px-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {playlist.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {playlist.songs.length} songs
                </p>
              </div>
              <Separator className="my-4" />
              <div className="relative">
                <ScrollArea>
                  <div className="grid grid-cols-2 gap-4 pb-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {playlist.songs.map(({ song }) => (
                      <SongArtwork
                        key={song.id}
                        song={song}
                        playlists={allPlaylists}
                        currentUserId={user?.id}
                        className="flex flex-col items-start justify-center p-2"
                        aspectRatio="square"
                        width={180}
                        height={180}
                      />
                    ))}
                    {playlist.songs.length === 0 && (
                        <div className="col-span-full flex items-center justify-center h-32 text-muted-foreground">
                            This playlist is empty.
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
