"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState, useTransition } from "react";
import { rsvpToEvent, cancelEventRsvp } from "./event-actions";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface EventRsvpButtonProps {
  eventId: string;
  isRegistered: boolean;
  ticketUrl?: string | null;
  ticketType?: string | null;
  className?: string;
}

export default function EventRsvpButton({
  eventId,
  isRegistered: initialRegistered,
  ticketUrl,
  ticketType,
  className,
}: EventRsvpButtonProps) {
  const [isRegistered, setIsRegistered] = useState(initialRegistered);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleRsvpToggle = () => {
    startTransition(async () => {
      try {
        if (isRegistered) {
          const res = await cancelEventRsvp(eventId);
          if (res.success) {
            setIsRegistered(false);
            toast({ description: "You have cancelled your registration." });
            router.refresh();
          } else {
            toast({ variant: "destructive", description: res.message });
          }
        } else {
          const res = await rsvpToEvent(eventId);
          if (res.success) {
            setIsRegistered(true);
            toast({ description: "You are registered for this event! 🎉" });
            router.refresh();
          } else {
            toast({ variant: "destructive", description: res.message });
          }
        }
      } catch (err) {
        toast({ variant: "destructive", description: "Something went wrong. Please try again." });
      }
    });
  };

  // If there's an external ticket URL, allow visiting it
  if (ticketUrl) {
    return (
      <Button asChild size="lg" className={className}>
        <a href={ticketUrl} target="_blank" rel="noopener noreferrer">
          {ticketType === "FREE" ? "Register Externally" : "Get Tickets"}
        </a>
      </Button>
    );
  }

  // Otherwise, handle in-platform RSVP
  if (isRegistered) {
    return (
      <Button
        variant="secondary"
        size="lg"
        disabled={isPending}
        onClick={handleRsvpToggle}
        className={className}
      >
        {isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Check className="mr-2 size-4 text-green-600" />
        )}
        Registered (Cancel)
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      disabled={isPending}
      onClick={handleRsvpToggle}
      className={className}
    >
      {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
      {ticketType === "FREE" ? "RSVP / Register Free" : "Register for Event"}
    </Button>
  );
}
