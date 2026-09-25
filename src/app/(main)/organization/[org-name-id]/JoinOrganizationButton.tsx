"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { joinOrganization, leaveOrganization } from "./member-actions";
import { useRouter } from "next/navigation";

interface JoinOrganizationButtonProps {
  organizationId: string;
  organizationName: string;
  isInitiallyMember: boolean;
  loggedInUserId?: string;
}

export function JoinOrganizationButton({
  organizationId,
  organizationName,
  isInitiallyMember,
  loggedInUserId,
}: JoinOrganizationButtonProps) {
  const [isMember, setIsMember] = useState(isInitiallyMember);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  if (!loggedInUserId) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl font-bold gap-1.5 h-10 px-4"
        onClick={() => router.push("/login")}
      >
        <UserPlus className="size-4 text-primary" />
        <span>Join Guild</span>
      </Button>
    );
  }

  const handleToggleMembership = () => {
    startTransition(async () => {
      try {
        if (isMember) {
          const res = await leaveOrganization(organizationId);
          setIsMember(false);
          toast({ description: res.message });
        } else {
          const res = await joinOrganization(organizationId);
          setIsMember(true);
          toast({ description: res.message });
        }
        router.refresh();
      } catch (err: any) {
        toast({
          variant: "destructive",
          description: err.message || "Failed to update membership",
        });
      }
    });
  };

  return (
    <Button
      variant={isMember ? "secondary" : "default"}
      size="sm"
      disabled={isPending}
      onClick={handleToggleMembership}
      className={`rounded-xl font-bold gap-1.5 h-10 px-4 transition-all shadow-sm ${
        isMember
          ? "border border-border/80 text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
      }`}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isMember ? (
        <>
          <UserCheck className="size-4 text-emerald-500" />
          <span>Member</span>
        </>
      ) : (
        <>
          <UserPlus className="size-4" />
          <span>Join Guild</span>
        </>
      )}
    </Button>
  );
}
