"use client";

import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { joinOrganizationActivity, leaveOrganizationActivity } from "../activity-actions";
import { useToast } from "@/components/ui/use-toast";
import { Check, Loader2, UserPlus } from "lucide-react";

interface ActivityJoinButtonProps {
  activityId: string;
  initialIsParticipating?: boolean;
  onParticipantsChange?: (diff: number) => void;
}

export function ActivityJoinButton({
  activityId,
  initialIsParticipating = false,
  onParticipantsChange,
}: ActivityJoinButtonProps) {
  const [isParticipating, setIsParticipating] = useState(initialIsParticipating);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        if (isParticipating) {
          const res = await leaveOrganizationActivity(activityId);
          if (res.success) {
            setIsParticipating(false);
            onParticipantsChange?.(-1);
            toast({ description: "You have left this activity." });
          } else {
            toast({ variant: "destructive", description: res.message });
          }
        } else {
          const res = await joinOrganizationActivity(activityId);
          if (res.success) {
            setIsParticipating(true);
            onParticipantsChange?.(1);
            toast({ description: "You have joined this activity!" });
          } else {
            toast({ variant: "destructive", description: res.message });
          }
        }
      } catch (err) {
        toast({ variant: "destructive", description: "Failed to update participation." });
      }
    });
  };

  return (
    <Button
      variant={isParticipating ? "secondary" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
      ) : isParticipating ? (
        <Check className="mr-1.5 size-3.5 text-green-600" />
      ) : (
        <UserPlus className="mr-1.5 size-3.5" />
      )}
      {isParticipating ? "Joined" : "Join Activity"}
    </Button>
  );
}
