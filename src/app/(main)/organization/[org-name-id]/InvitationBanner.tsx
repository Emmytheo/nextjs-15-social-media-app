"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { acceptOrganizationInvitation, declineOrganizationInvitation } from "./member-actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface InvitationBannerProps {
  notificationId: string;
}

export default function InvitationBanner({ notificationId }: InvitationBannerProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleAccept = () => {
    startTransition(async () => {
      try {
        const result = await acceptOrganizationInvitation(notificationId);
        if (result.success) {
          toast({
            description: result.message,
          });
          router.refresh();
        } else {
          toast({
            variant: "destructive",
            description: result.message,
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          description: "Something went wrong. Please try again.",
        });
      }
    });
  };

  const handleDecline = () => {
    startTransition(async () => {
      try {
        const result = await declineOrganizationInvitation(notificationId);
        if (result.success) {
          toast({
            description: "Invitation declined",
          });
          router.refresh();
        } else {
          toast({
            variant: "destructive",
            description: result.message,
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          description: "Something went wrong. Please try again.",
        });
      }
    });
  };

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-3 py-3.5 sm:px-4 rounded-xl mb-4 backdrop-blur-sm">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h3 className="font-semibold text-lg text-primary">Pending Invitation</h3>
          <p className="text-sm text-muted-foreground">
            You have been invited to join this organization.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            Decline
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Accept Invitation
          </Button>
        </div>
      </div>
    </div>
  );
}
