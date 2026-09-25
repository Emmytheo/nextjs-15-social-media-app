"use client";

import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface OrganizationButtonProps {
  initialState?: { unreadCount?: number };
}

export default function OrganizationButton({ initialState }: OrganizationButtonProps = {}) {
  const pathname = usePathname();
  const isActive = pathname === "/organization" || pathname.startsWith("/organization/");

  return (
    <Button
      variant="ghost"
      className={clsx("flex items-center justify-start gap-3", {
        "bg-accent text-accent-foreground": isActive,
      })}
      title="Organizations"
      asChild
    >
      <Link href="/organization">
        <div className="relative">
          <Building2
            className={clsx("", {
              "text-primary": isActive,
            })}
          />
        </div>
        <span
          className={clsx("hidden lg:inline", {
            "text-primary": isActive,
          })}
        >
          Organizations
        </span>
      </Link>
    </Button>
  );
}
