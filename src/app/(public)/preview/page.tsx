import { Metadata } from "next";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Tabs,

    return (
        <div className="border-t">
            <div className="bg-background">
                <div className="grid">
                    <div className="col-span-3 lg:col-span-4">
                        <div className="h-full px-4 py-6 lg:px-8">
                            <Tabs defaultValue="music" className="h-full space-y-6">
                                <div className="space-between flex items-center">
                                    <TabsList className="w-full !justify-start overflow-x-auto shadow-md">
                                        <TabsTrigger value="music" className="relative">
                                            Music Library
                                        </TabsTrigger>
                                        <TabsTrigger value="selections">
                                            Curated Selections
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                {/* Music Tab */}
                                <TabsContent
                                    value="music"
                                    className="border-none p-0 outline-none"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-semibold tracking-tight">
                                                Browse Music
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                Explore our choral music library. Sign in to like and save your favorites.
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
                                                        playlists={[]}
                                                        currentUserId={null}
                                                        aspectRatio="portrait"
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
                                                        playlists={[]}
                                                        currentUserId={null}
                                                        aspectRatio="square"
                                                        height={180}
                                                        className="flex flex-col items-start justify-center p-2"
                                                    />
                                                ))}
                                            </div>
                                            <ScrollBar orientation="horizontal" />
                                        </ScrollArea>
                                    </div>
                                </TabsContent>

                                {/* Selections Tab */}
                                <TabsContent
                                    value="selections"
                                    className="h-full flex-col border-none p-0 data-[state=active]:flex"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-semibold tracking-tight">
                                                Curated Selections
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                Browse selections curated for events and activities.
                                            </p>
                                        </div>
                                    </div>
                                    <Separator className="my-4" />
                                    <SelectionsTab selections={selections} baseRoute="/preview" />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
