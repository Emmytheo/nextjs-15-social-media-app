"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { acceptOrganizationInvitation } from "./member-actions";
import { useToast } from "@/components/ui/use-toast";

interface InvitationBannerProps {
    notificationId: string;
}

export default function InvitationBanner({ notificationId }: InvitationBannerProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleAccept = () => {
        startTransition(async () => {
            try {
                const result = await acceptOrganizationInvitation(notificationId);
                if (result.success) {
                    toast({
                        description: result.message,
                    });
                    // Refresh the page to update UI state (remove banner, show member content)
                    window.location.reload();
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
        <div className="bg-primary/10 border-b border-primary/20 p-4 sticky top-0 z-50 backdrop-blur-sm">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-lg text-primary">Pending Invitation</h3>
                    <p className="text-sm text-muted-foreground">
                        You have been invited to interact with this organization.
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Add Decline button later if needed */}
                    <Button
                        onClick={handleAccept}
                        disabled={isPending}
                        className="w-full sm:w-auto"
                    >
                        {isPending ? "Accepting..." : "Accept Invitation"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
