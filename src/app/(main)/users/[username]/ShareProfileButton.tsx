"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Share2, Check } from "lucide-react";

export default function ShareProfileButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast({ description: `@${username}'s profile link copied! 📋` });
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast({ description: "Unable to copy link" });
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleShare}
      title="Share profile link"
      className="h-10 w-10 rounded-xl shrink-0"
    >
      {copied ? <Check className="size-4 text-emerald-600" /> : <Share2 className="size-4" />}
    </Button>
  );
}
