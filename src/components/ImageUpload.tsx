"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import Image from "next/image";
import { toast } from "./ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  endpoint: "organizationLogo" | "organizationBanner";
}

export function ImageUpload({ value, onChange, endpoint }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { startUpload } = useUploadThing(endpoint);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true);
      try {
        const res = await startUpload(acceptedFiles);
        if (res && res[0]?.url) {
          onChange(res[0].url);
        }
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Could not upload image",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [startUpload, onChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
    >
      <input {...getInputProps()} />
      {value ? (
        <div className="relative h-48 w-full">
          <Image
            src={value}
            alt="Uploaded"
            fill
            className="object-contain"
          />
        </div>
      ) : (
        <>
          <Upload className="h-8 w-8 mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            Drag & drop an image here, or click to select
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2"
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Select Image"}
          </Button>
        </>
      )}
    </div>
  );
}
