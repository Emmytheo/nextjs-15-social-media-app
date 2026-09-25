"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, X } from "lucide-react";

interface MediaLightboxProps {
  url: string | null;
  onClose: () => void;
}

export default function MediaLightbox({ url, onClose }: MediaLightboxProps) {
  if (!url) return null;

  return (
    <Dialog open={!!url} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] border-none bg-black/90 p-0 text-white shadow-2xl backdrop-blur-md sm:max-w-4xl sm:rounded-2xl">
        <DialogTitle className="sr-only">Media Preview</DialogTitle>
        <div className="relative flex max-h-[90vh] min-h-[50vh] w-full items-center justify-center p-4">
          <div className="relative max-h-[85vh] max-w-full overflow-hidden rounded-lg">
            <img
              src={url}
              alt="Media full view"
              className="max-h-[85vh] w-auto max-w-full object-contain"
            />
          </div>

          {/* Action buttons */}
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex size-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/90"
              title="Download image"
            >
              <Download className="size-5" />
            </a>
            <button
              onClick={onClose}
              className="flex size-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/90"
              title="Close"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
