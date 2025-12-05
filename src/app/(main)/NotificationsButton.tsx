"use client";

import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { NotificationCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface NotificationsButtonProps {
  initialState: NotificationCountInfo;
}

export default function NotificationsButton({
  initialState,
}: NotificationsButtonProps) {
  const { data } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: () =>
      kyInstance
        .get("/api/notifications/unread-count")
        .json<NotificationCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000,
  });
  const pathname = usePathname();

  const isAcitve = pathname === "/notifications";

  return (
    <Button
      variant="ghost"
      className={clsx("flex items-center justify-start gap-3", {
        "bg-accent text-accent-foreground": isAcitve,
      })}
      title="Notifications"
      asChild
    >
      <Link href="/notifications">
        <div className="relative">
          <Bell
            className={clsx("", {
              "text-primary": isAcitve,
            })}
          />
          {!!data.unreadCount && (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-xs font-medium tabular-nums text-primary-foreground">
              {data.unreadCount}
            </span>
          )}
        </div>
        <span
          className={clsx("hidden lg:inline", {
            "text-primary": isAcitve,
          })}
        >
          Notifications
        </span>
      </Link>
    </Button>
  );
}
