"use client";

import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { MessageCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx"

interface MessagesButtonProps {
  initialState: MessageCountInfo;
}

export default function MessagesButton({ initialState }: MessagesButtonProps) {
  const { data } = useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: () =>
      kyInstance.get("/api/messages/unread-count").json<MessageCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000,
  });
  const pathname = usePathname();
  const isAcitve = pathname === "/messages";

  return (
    <Button
      variant="ghost"
      className={clsx("flex items-center justify-start gap-3", {
              "bg-accent text-accent-foreground": isAcitve,
            })}
      title="Messages"
      asChild
    >
      <Link href="/messages">
        <div className="relative">
          <Mail className={clsx("", {
            "text-primary": isAcitve,
          })}/>
          {!!data.unreadCount && (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-xs font-medium tabular-nums text-primary-foreground">
              {data.unreadCount}
            </span>
          )}
        </div>
        <span className={clsx("hidden lg:inline", {
            "text-primary": isAcitve,
          })}>Messages</span>
      </Link>
    </Button>
  );
}
