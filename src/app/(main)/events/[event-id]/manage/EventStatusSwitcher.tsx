"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle, AlertCircle, Globe, Lock, Loader2 } from "lucide-react";

interface EventStatusSwitcherProps {
  eventId: string;
  currentStatus: string;
  isPublished: boolean;
}

const statuses = [
  {
    value: "DRAFT",
    label: "Draft",
    description: "Not visible to the public",
    icon: AlertCircle,
    className: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    activeClass: "ring-2 ring-yellow-400",
  },
  {
    value: "PUBLISHED",
    label: "Published",
    description: "Live and visible to all",
    icon: CheckCircle2,
    className: "border-green-200 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300",
    activeClass: "ring-2 ring-green-400",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    description: "Event has been cancelled",
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300",
    activeClass: "ring-2 ring-red-400",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    description: "Event has concluded",
    icon: Clock,
    className: "border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    activeClass: "ring-2 ring-blue-400",
  },
];

export function EventStatusSwitcher({
  eventId,
  currentStatus,
  isPublished: initialPublished,
}: EventStatusSwitcherProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [loading, setLoading] = useState<string | null>(null);

  async function updateEvent(updates: { status?: string; isPublished?: boolean }) {
    const key = JSON.stringify(updates);
    setLoading(key);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update event");
      }

      if (updates.status) setStatus(updates.status);
      if (updates.isPublished !== undefined) setIsPublished(updates.isPublished);
      toast.success("Event updated successfully.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Status Selector */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">Lifecycle Status</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statuses.map((s) => {
            const isActive = status === s.value;
            const Icon = s.icon;
            return (
              <button
                key={s.value}
                onClick={() => !isActive && updateEvent({ status: s.value })}
                disabled={isActive || loading !== null}
                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-default ${s.className} ${isActive ? s.activeClass : "opacity-70 hover:opacity-100"}`}
              >
                <div className="flex items-center gap-2 w-full justify-between">
                  <Icon className="size-4" />
                  {isActive && loading !== null && <Loader2 className="size-3 animate-spin" />}
                </div>
                <span className="font-semibold text-sm">{s.label}</span>
                <span className="text-xs opacity-75">{s.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Published Toggle */}
      <div className="flex items-center justify-between rounded-xl border p-4 bg-muted/30">
        <div className="flex items-center gap-3">
          {isPublished ? (
            <Globe className="size-5 text-green-600" />
          ) : (
            <Lock className="size-5 text-muted-foreground" />
          )}
          <div>
            <p className="font-medium text-sm">
              {isPublished ? "Publicly Visible" : "Hidden from Public"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isPublished
                ? "This event appears in the events directory."
                : "This event is only accessible via direct link."}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant={isPublished ? "destructive" : "default"}
          onClick={() => updateEvent({ isPublished: !isPublished })}
          disabled={loading !== null}
          className="shrink-0"
        >
          {loading !== null && <Loader2 className="mr-2 size-3 animate-spin" />}
          {isPublished ? "Unpublish" : "Publish Now"}
        </Button>
      </div>
    </div>
  );
}
