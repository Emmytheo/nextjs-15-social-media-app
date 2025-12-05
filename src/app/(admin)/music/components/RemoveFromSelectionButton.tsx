"use client";

import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { removeFromSelection } from "../actions";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface RemoveFromSelectionButtonProps {
  selectionId: string;
  songId: string;
}

export function RemoveFromSelectionButton({
  selectionId,
  songId,
}: RemoveFromSelectionButtonProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      const result = await removeFromSelection(selectionId, songId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Song removed from selection",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove song from selection",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-destructive"
      onClick={handleRemove}
      disabled={isRemoving}
    >
      {isRemoving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash className="h-4 w-4" />
      )}
    </Button>
  );
}
