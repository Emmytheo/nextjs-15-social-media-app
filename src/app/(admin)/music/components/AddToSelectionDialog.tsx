"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { addToSelection, getOrganizationSelections } from "../actions";
import { Loader2 } from "lucide-react";

interface AddToSelectionDialogProps {
  songId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToSelectionDialog({
  songId,
  open,
  onOpenChange,
}: AddToSelectionDialogProps) {
  const [selections, setSelections] = useState<any[]>([]);
  const [selectedSelectionId, setSelectedSelectionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadSelections();
    }
  }, [open]);

  const loadSelections = async () => {
    setIsLoading(true);
    try {
      const data = await getOrganizationSelections();
      setSelections(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load selections",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSelectionId) return;

    setIsSubmitting(true);
    try {
      const result = await addToSelection(selectedSelectionId, songId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Song added to selection",
        });
        onOpenChange(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to add song to selection",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Selection</DialogTitle>
          <DialogDescription>
            Choose an organization selection to add this song to.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="selection">Selection</Label>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : selections.length > 0 ? (
                <Select
                  value={selectedSelectionId}
                  onValueChange={setSelectedSelectionId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a selection" />
                  </SelectTrigger>
                  <SelectContent>
                    {selections.map((selection) => (
                      <SelectItem key={selection.id} value={selection.id}>
                        {selection.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No selections available. Create one first.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedSelectionId || isSubmitting || isLoading}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add to Selection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
