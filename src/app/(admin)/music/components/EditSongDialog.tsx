"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { updateSong } from "../actions";
import { Song } from "@prisma/client";
import { useUploadThing } from "@/lib/uploadthing";

interface EditSongDialogProps {
  song: Song;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSongDialog({ song, open, onOpenChange }: EditSongDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: song.title,
    artist: song.artist,
    genre: song.genre || "",
    lyrics: song.lyrics || "",
    coverUrl: song.coverUrl,
    audioUrl: song.audioUrl,
    sheetMusicUrl: song.sheetMusicUrl,
  });
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const { startUpload: startAudioUpload } = useUploadThing("songAudio");
  const { startUpload: startSheetUpload } = useUploadThing("songSheet");
  const { startUpload: startCoverUpload } = useUploadThing("songCover");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let newAudioUrl = formData.audioUrl;
      let newSheetMusicUrl = formData.sheetMusicUrl;
      let newCoverUrl = formData.coverUrl;

      const uploadPromises = [];

      if (audioFile) uploadPromises.push(startAudioUpload([audioFile]));
      else uploadPromises.push(Promise.resolve(null));

      if (sheetFile) uploadPromises.push(startSheetUpload([sheetFile]));
      else uploadPromises.push(Promise.resolve(null));

      if (coverFile) uploadPromises.push(startCoverUpload([coverFile]));
      else uploadPromises.push(Promise.resolve(null));

      const [audioRes, sheetRes, coverRes] = await Promise.all(uploadPromises);

      if (audioFile && !audioRes) throw new Error("Failed to upload audio");
      if (audioRes) newAudioUrl = audioRes[0].url;

      if (sheetFile && !sheetRes) throw new Error("Failed to upload sheet music");
      if (sheetRes) newSheetMusicUrl = sheetRes[0].url;

      if (coverFile && !coverRes) throw new Error("Failed to upload cover");
      if (coverRes) newCoverUrl = coverRes[0].url;

      await updateSong(song.id, {
        ...formData,
        duration: song.duration || undefined,
        audioUrl: newAudioUrl || undefined, // Convert null to undefined
        sheetMusicUrl: newSheetMusicUrl || undefined, // Convert null to undefined
        coverUrl: newCoverUrl || undefined, // Convert null to undefined
      });

      toast({
        title: "Success",
        description: "Song updated successfully",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update song",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Song</DialogTitle>
          <DialogDescription>
            Make changes to the song details here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="artist">Artist</Label>
            <Input
              id="artist"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="genre">Genre</Label>
            <Input
              id="genre"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Cover Image</Label>
            {formData.coverUrl && !coverFile && (
              <div className="relative aspect-square w-20 overflow-hidden rounded-md border">
                <img src={formData.coverUrl} alt="Cover" className="object-cover w-full h-full" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0 h-6 w-6"
                  onClick={() => setFormData({ ...formData, coverUrl: null })}
                >
                  X
                </Button>
              </div>
            )}
             <Input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            />
          </div>
           <div className="grid gap-2">
            <Label>Audio File</Label>
             {formData.audioUrl && !audioFile && (
                <div className="flex items-center gap-2">
                    <audio src={formData.audioUrl} controls className="h-8 w-full" />
                     <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setFormData({ ...formData, audioUrl: null })}
                        >
                        X
                    </Button>
                </div>
            )}
             <Input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            />
          </div>
           <div className="grid gap-2">
            <Label>Sheet Music (PDF)</Label>
             {formData.sheetMusicUrl && !sheetFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="truncate flex-1">{formData.sheetMusicUrl.split('/').pop()}</span>
                     <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setFormData({ ...formData, sheetMusicUrl: null })}
                        >
                        X
                    </Button>
                </div>
            )}
             <Input
                type="file"
                accept=".pdf"
                onChange={(e) => setSheetFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lyrics">Lyrics</Label>
            <textarea
              id="lyrics"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.lyrics}
              onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
