"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface MilestoneRow {
  id: string;
  title: string;
  targetAmount: number;
  order: number;
  proofOfWork: string | null;
  campaign: {
    id: string;
    title: string;
    creator: {
      displayName: string;
    };
  };
}

export function TreasuryMilestoneApproval({ milestone }: { milestone: MilestoneRow }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/crowdfunding/${milestone.campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve_release",
          milestoneId: milestone.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to release milestone");

      toast({
        title: "Escrow Released!",
        description: `$${milestone.targetAmount.toLocaleString()} released to ${milestone.campaign.creator.displayName}.`,
      });

      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Approval Error",
        description: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Verify & Release
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              Approve Tranche Disbursement
            </DialogTitle>
            <DialogDescription>
              Release <strong>${milestone.targetAmount.toLocaleString()}</strong> from Escrow for Phase {milestone.order} of &ldquo;{milestone.campaign.title}&rdquo;.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-xl bg-muted/60 border space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5 text-primary" />
                Submitted Deliverables Proof:
              </p>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {milestone.proofOfWork || "No text provided."}
              </p>
            </div>
            <p className="text-muted-foreground">
              Project Lead: <strong>{milestone.campaign.creator.displayName}</strong>
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApprove}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting ? "Releasing..." : "Confirm & Disburse Funds"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
