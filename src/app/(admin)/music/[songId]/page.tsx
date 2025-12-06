
import { getSong } from "../actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText, Music, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs-new";
import { SongActions } from "../components/SongActions";
import { SongPlayer } from "@/app/(admin)/music/components/SongPlayer";

interface SongPageProps {
  params: {
    songId: string;
  };
}

export default async function SongPage({ params }: SongPageProps) {
  const song = await getSong(params.songId);

  if (!song) {
    notFound();
  }

  return (
    <div className="container px-6 py-6 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/music">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Song Details</h1>
        <div className="ml-auto">
          <SongActions song={song} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Cover & Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="aspect-square relative rounded-lg overflow-hidden border bg-muted shadow-md">
            {song.coverUrl ? (
              <Image
                src={song.coverUrl}
                alt={song.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="bg-card dark:bg-muted flex items-center justify-center h-full w-full text-muted-foreground">
                <Music className="h-24 w-24" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{song.title}</h2>
            <p className="text-lg text-muted-foreground">{song.artist}</p>
            {song.genre && (
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                {song.genre}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Audio</h3>
              {song.audioUrl ? (
                <SongPlayer audioUrl={song.audioUrl} />
              ) : (
                <p className="text-sm text-muted-foreground">No audio available</p>
              )}
            </div>

            {/* About / Description Section */}
            {/* <div className="space-y-2">
                <h3 className="font-medium">About this Song</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                        <strong>Title:</strong> {song.title}
                    </p>
                    <p>
                        <strong>Artist/Composer:</strong> {song.artist}
                    </p>
                    {song.genre && (
                         <p>
                            <strong>Genre:</strong> {song.genre}
                        </p>
                    )}
                    {song.duration && (
                        <p>
                            <strong>Duration:</strong> {Math.floor(song.duration / 60)}:{Math.floor(song.duration % 60).toString().padStart(2, '0')}
                        </p>
                    )}
                     <p>
                        <strong>Added:</strong> {new Date(song.createdAt).toLocaleDateString()}
                    </p>
                </div>
             </div> */}

            <div className="space-y-2">
              <h3 className="font-medium">Sheet Music</h3>
              {song.sheetMusicUrl ? (
                <div className="flex gap-2">
                  {/* Mobile View: Sheet/Lyrics Button */}
                  <div className="md:hidden col-span-1 flex w-full justify-center">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="w-full"><FileText className="mr-2 h-4 w-4" /> View Sheet Music / Lyrics</Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-full w-full">
                        <SheetHeader>
                          <SheetTitle>Sheet Music & Lyrics</SheetTitle>
                          <SheetDescription>
                            View the sheet music preview or lyrics for this song.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="py-4 h-full">
                          <Tabs defaultValue="sheet" className="w-full h-full flex flex-col">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="sheet">Sheet Music</TabsTrigger>
                              <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
                            </TabsList>
                            <TabsContent value="sheet" className="flex-1 mt-4 overflow-y-auto">
                              <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full flex flex-col">
                                <div className="p-2 md:p-6 flex-1">
                                  {song.sheetMusicUrl ? (
                                    <iframe
                                      src={`${song.sheetMusicUrl}#toolbar=0`}
                                      className="w-full h-full min-h-[50vh] rounded-md border"
                                      title="Sheet Music"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                      <p>No sheet music to preview</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent value="lyrics" className="mt-4 overflow-y-auto flex-1">
                              <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full flex items-center justify-center">
                                <div className="p-6 text-center">
                                  <h3 className="text-xl font-semibold text-muted-foreground">Coming Soon</h3>
                                  <p className="text-sm text-muted-foreground mt-2">Lyrics view is currently under development.</p>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                  <Button asChild variant="outline" size="icon" className="flex md:w-full justify-center">
                    <a href={song.sheetMusicUrl} download>
                      <Download className="h-4 w-4" />
                      <span className="hidden md:flex col-span-1">Download Sheet Music / Lyrics</span>
                    </a>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No sheet music available</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Lyrics / PDF Preview */}
        <div className="hidden md:col-span-2 md:block space-y-6">
          <Tabs defaultValue="sheet" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sheet">Sheet Music</TabsTrigger>
              <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
            </TabsList>
            <TabsContent value="sheet" className="flex-1 mt-4">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full min-h-[600px] flex flex-col">
                <div className="p-6 flex-1">
                  {song.sheetMusicUrl ? (
                    <iframe
                      src={`${song.sheetMusicUrl}#toolbar=0`}
                      className="w-full h-full min-h-[600px] rounded-md border"
                      title="Sheet Music"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>No sheet music to preview</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="lyrics" className="mt-4">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm min-h-[600px] flex items-center justify-center">
                <div className="p-6 text-center">
                  <h3 className="text-2xl font-semibold text-muted-foreground">Coming Soon</h3>
                  <p className="text-sm text-muted-foreground mt-2">Lyrics view is currently under development.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>


      </div>
    </div>
  );
}
