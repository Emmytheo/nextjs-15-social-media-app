"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "./ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { OurFileRouter } from "@/app/api/uploadthing/core";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  endpoint: keyof OurFileRouter;
  className?: string;
}

export function ImageUpload({ value, onChange, endpoint, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { startUpload } = useUploadThing(endpoint);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      setIsUploading(true);
      try {
        const res = await startUpload(acceptedFiles);
        if (res && res[0]?.url) {
          onChange(res[0].url);
        }
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Could not upload image. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [startUpload, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className={className}>
      {value ? (
        <div className="relative group overflow-hidden rounded-2xl border bg-muted/30 aspect-video w-full flex items-center justify-center">
          <Image
            src={value}
            alt="Uploaded media"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <div {...getRootProps()} className="cursor-pointer">
              <input {...getInputProps()} />
              <Button type="button" size="sm" variant="secondary" className="rounded-xl text-xs gap-1.5 shadow-md">
                <Upload className="h-3.5 w-3.5" />
                Change Image
              </Button>
            </div>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="rounded-xl text-xs gap-1.5 shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs font-semibold">Uploading...</span>
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/40"
          } ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">Uploading image...</p>
              <p className="text-xs text-muted-foreground">Please wait while your file is processing</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-1">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Drop your image here, or <span className="text-primary underline">browse</span>
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP, or GIF up to 8MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
