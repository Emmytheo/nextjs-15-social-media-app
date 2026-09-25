"use client";

import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleHighlightLike } from "../highlight-actions";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface HighlightLikeButtonProps {
  highlightId: string;
  initialLikes: number;
  initialIsLiked?: boolean;
}

export function HighlightLikeButton({
  highlightId,
  initialLikes,
  initialIsLiked = false,
}: HighlightLikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleLike = () => {
    // Optimistic update
    const nextIsLiked = !isLiked;
    const nextLikes = nextIsLiked ? likes + 1 : Math.max(0, likes - 1);
    setIsLiked(nextIsLiked);
    setLikes(nextLikes);

    startTransition(async () => {
      try {
        const result = await toggleHighlightLike(highlightId);
        setIsLiked(result.isLiked);
        setLikes(result.likesCount);
      } catch (err) {
        // Rollback on error
        setIsLiked(!nextIsLiked);
        setLikes(likes);
        toast({
          variant: "destructive",
          description: "Please sign in to like highlights.",
        });
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isPending}
      className={cn("transition-colors", isLiked && "text-red-500 hover:text-red-600")}
    >
      <Heart className={cn("w-4 h-4 mr-1.5", isLiked && "fill-current text-red-500")} />
      <span>{likes}</span>
    </Button>
  );
}
