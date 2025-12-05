import { Metadata } from "next";
import Image from "next/image";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs-new";

import { AlbumArtwork } from "./components/album-artwork";
import { Menu } from "./components/menu";
import { PodcastEmptyPlaceholder } from "./components/podcast-empty-placeholder";
import { AppSidebar } from "./components/sidebar";
import { listenNowAlbums, madeForYouAlbums } from "./data/albums";
import { playlists } from "./data/playlists";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSongs, getRecentSongs, getPlaylists, getOrganizationSelections } from "./actions";
import { AddSongDialog } from "./components/AddSongDialog";
import { SongArtwork } from "./components/song-artwork";
import { PlaylistDialog } from "./components/playlist-dialog";
import { MobileActions } from "./components/MobileActions";
import { PlaylistsTab } from "./components/PlaylistsTab";
import { SelectionsTab } from "./components/SelectionsTab";
import { playlists as categories } from "./data/playlists";
import { SearchInput } from "./components/SearchInput";
import { GenreSelect } from "./components/GenreSelect";

export const metadata: Metadata = {
  title: "Music Library",
};

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface MusicPageProps {
  searchParams: {
    q?: string;
    genre?: string;
  };
}

export default async function MusicPage({ searchParams }: MusicPageProps) {
  const songs = await getSongs(searchParams.q, searchParams.genre);
  const recentSongs = await getRecentSongs(10);
  const playlists = await getPlaylists();
  const selections = await getOrganizationSelections();
  const { user } = await validateRequest();

  let isAdmin = false;
  if (user) {
    const orgAdmins = await prisma.organizationAdmin.findMany({
      where: { userId: user.id },
    });
    isAdmin = orgAdmins.length > 0;
  }

  return (
    <div className="border-t">
      <div className="bg-background">
        <div className="grid">
          <div className="col-span-3 lg:col-span-4 lg:border-l">
            <div className="h-full px-4 py-6 lg:px-8">
              <Tabs defaultValue="music" className="h-full space-y-6">
                <div className="space-between flex items-center sticky top-[20px] z-10 bg-background">
                  <TabsList style={{ scrollbarWidth: "none" }} className="w-full !justify-start overflow-x-auto shadow-md">
                    <TabsTrigger value="music" className="relative">
                      Music
                    </TabsTrigger>
                    <TabsTrigger value="playlists">Playlists</TabsTrigger>
                    <TabsTrigger value="selections">
                      Selections
                    </TabsTrigger>
                  </TabsList>
                  <div className="mx-4 hidden md:flex gap-2">
                    <PlaylistDialog />
                    {isAdmin && <AddSongDialog />}
                  </div>
                </div>
                <TabsContent
                  value="music"
                  className="border-none p-0 outline-none"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        Listen Now
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Top picks for you. Updated daily.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                      <SearchInput />
                    </div>
                    <div>
                      <GenreSelect categories={categories} />
                    </div>
                  </div>

                  <Separator className="my-4" />
                  <div className="relative grid overflow-hidden">
                    <ScrollArea>
                      <div className="flex w-full space-x-4 overflow-x-hidden pb-4">
                        {songs.map((song) => (
                          <SongArtwork
                            key={song.id}
                            song={song}
                            playlists={playlists}
                            currentUserId={user?.id}
                            aspectRatio="portrait"
                            // width={200}
                            height={260}
                            className="flex w-[200px] flex-col items-start justify-center px-2 md:w-[250px]"
                          />
                        ))}
                        {songs.length === 0 && (
                          <div className="flex items-center justify-center w-full h-32 text-muted-foreground">
                            No songs found.
                          </div>
                        )}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                  <div className="mt-6 space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      Recently Added
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Freshly uploaded choral music.
                    </p>
                  </div>
                  <Separator className="my-4" />
                  <div className="relative">
                    <ScrollArea>
                      <div className="grid grid-cols-2 gap-2 pb-4 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                        {recentSongs.map((song) => (
                          <SongArtwork
                            key={song.id}
                            song={song}
                            playlists={playlists}
                            currentUserId={user?.id}
                            aspectRatio="square"
                            // width={180}
                            height={180}
                            className="flex flex-col items-start justify-center p-2"
                          />
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                </TabsContent>
                <TabsContent
                  value="playlists"
                  className="h-full flex-col border-none p-0 data-[state=active]:flex"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        Your Playlists
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Personal collections of your favorite songs.
                      </p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <PlaylistsTab playlists={playlists} />
                </TabsContent>
                <TabsContent
                  value="selections"
                  className="h-full flex-col border-none p-0 data-[state=active]:flex"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        Organization Selections
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Curated selections for events and activities.
                      </p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <SelectionsTab selections={selections} />
                </TabsContent>
              </Tabs>
              <MobileActions isAdmin={isAdmin} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
