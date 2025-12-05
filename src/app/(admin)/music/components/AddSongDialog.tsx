"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Upload, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createSong } from "../actions";
import { useUploadThing } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import Image from "next/image";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  genre: z.string().optional(),
  duration: z.coerce.number().optional(),
  lyrics: z.string().optional(),
});

interface AddSongDialogProps {
  children?: React.ReactNode;
}

export function AddSongDialog({ children }: AddSongDialogProps) {
  const [open, setOpen] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const { startUpload: startAudioUpload } = useUploadThing("songAudio");
  const { startUpload: startSheetUpload } = useUploadThing("songSheet");
  const { startUpload: startCoverUpload } = useUploadThing("songCover");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      artist: "",
      genre: "",
      duration: 0,
      lyrics: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!audioFile) {
      toast({
        variant: "destructive",
        title: "Audio file required",
        description: "Please upload an audio file for the song.",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload files in parallel
      const uploadPromises = [];
      
      uploadPromises.push(startAudioUpload([audioFile]));
      
      if (sheetFile) {
        uploadPromises.push(startSheetUpload([sheetFile]));
      } else {
        uploadPromises.push(Promise.resolve(null));
      }

      if (coverFile) {
        uploadPromises.push(startCoverUpload([coverFile]));
      } else {
        uploadPromises.push(Promise.resolve(null));
      }

      const [audioRes, sheetRes, coverRes] = await Promise.all(uploadPromises);

      if (!audioRes) throw new Error("Failed to upload audio");

      await createSong({
        ...values,
        audioUrl: audioRes[0].url,
        sheetMusicUrl: sheetRes ? sheetRes[0].url : undefined,
        coverUrl: coverRes ? coverRes[0].url : undefined,
      });

      toast({
        title: "Success",
        description: "Song added successfully",
      });
      
      setOpen(false);
      form.reset();
      setAudioFile(null);
      setSheetFile(null);
      setCoverFile(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Music
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Song</DialogTitle>
          <DialogDescription>
            Upload audio, sheet music, and details for the new song.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Song title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="artist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artist</FormLabel>
                  <FormControl>
                    <Input placeholder="Artist name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <FormControl>
                      <Input placeholder="Genre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (sec)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="180" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* File Uploads */}
            <div className="space-y-2">
              <FormLabel>Audio File (Required)</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <FormLabel>Sheet Music (PDF)</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSheetFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <FormLabel>Cover Art</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                />
              </div>
              {coverFile && (
                  <div className="relative w-20 h-20 mt-2">
                      <Image 
                        src={URL.createObjectURL(coverFile)} 
                        alt="Preview" 
                        fill 
                        className="object-cover rounded-md"
                      />
                  </div>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Save Song"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
