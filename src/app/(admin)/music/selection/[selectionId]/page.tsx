import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getSelectionById } from "../../actions";
import { SongListTile } from "../../components/SongListTile";
import { RemoveFromSelectionButton } from "../../components/RemoveFromSelectionButton";

interface SelectionPageProps {
  params: {
    selectionId: string;
  };
}

export default async function SelectionPage({ params }: SelectionPageProps) {
  const selection = await getSelectionById(params.selectionId);

  if (!selection) {
    notFound();
  }

  return (
    <div className="container py-6 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/music">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Selection Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h2 className="text-2xl font-semibold mb-2">{selection.title}</h2>
            {selection.description && (
              <p className="text-muted-foreground mb-4">{selection.description}</p>
            )}
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(selection.createdAt).toLocaleDateString()}</span>
            </div>
             <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <Music className="h-4 w-4" />
                <span>{selection.songs.length} songs</span>
            </div>
          </div>
          
          {selection.purpose && (
             <div className="p-6 rounded-lg border bg-muted/50">
                <h3 className="font-semibold mb-2">Purpose</h3>
                <p className="text-sm text-muted-foreground">{selection.purpose}</p>
             </div>
          )}
        </div>

        {/* Right Column: Song List */}
        <div className="md:col-span-2 space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-4">Songs</h2>
                <div className="space-y-4">
                    {selection.songs.length > 0 ? (
                        selection.songs.map(({ song }) => (
                            <div key={song.id} className="flex items-center gap-2">
                                <SongListTile
                                    song={song}
                                    className="flex-1"
                                    showPlayer={true}
                                />
                                <RemoveFromSelectionButton selectionId={selection.id} songId={song.id} />
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 border rounded-lg border-dashed">
                            <p className="text-muted-foreground">No songs in this selection yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
