"use client";

import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { NotificationCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Bell, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface HomeButtonProps {
  initialState?: any;
}

export default function HomeButton({ initialState }: HomeButtonProps) {
  const pathname = usePathname();

  const isAcitve = pathname === "/";

  return (
    <Button
      variant="ghost"
      className={clsx("flex items-center justify-start gap-3", {
        "bg-accent text-accent-foreground": isAcitve,
      })}
      title="home"
      asChild
    >
      <Link href="/">
        <div className="relative">
          <Home
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
          Home
        </span>
      </Link>
    </Button>
  );
}
