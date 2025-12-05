"use client";

import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { NotificationCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Bell, Bookmark } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface BookmarksButtonProps {
  initialState?: any;
}

export default function BookmarksButton({
  initialState,
}: BookmarksButtonProps) {
  const pathname = usePathname();

  const isAcitve = pathname === "/bookmarks";

  return (
    <Button
      variant="ghost"
      className={clsx("flex items-center justify-start gap-3", {
              "bg-accent text-accent-foreground": isAcitve,
            })}
      title="bookmarks"
      asChild
    >
      <Link href="/bookmarks">
        <div className="relative">
          <Bookmark
            className={clsx("", {
              "text-primary": isAcitve,
            })}
          />
        </div>
        <span
          className={clsx("hidden lg:inline", {
            "text-primary": isAcitve,
          })}
        >
          Bookmarks
        </span>
      </Link>
    </Button>
  );
}
