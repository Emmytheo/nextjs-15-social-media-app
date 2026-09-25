"use client";

import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function CrowdfundingButton() {
  const pathname = usePathname();
  const isActive = pathname.startsWith("/crowdfunding");

  return (
    <Button
      variant="ghost"
      className={clsx(
        "flex w-full items-center justify-start gap-3 rounded-xl px-3 py-2.5 transition-all",
        isActive
          ? "bg-primary/10 text-primary font-bold shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
      )}
      title="Crowdfunding & Escrow Grants"
      asChild
    >
      <Link href="/crowdfunding">
        <div className="relative">
          <Coins className={clsx("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
        </div>
        <span className="hidden lg:inline text-sm">Crowdfunding</span>
      </Link>
    </Button>
  );
}
