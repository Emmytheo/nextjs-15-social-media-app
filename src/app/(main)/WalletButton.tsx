"use client";

import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function WalletButton() {
  const pathname = usePathname();
  const isActive = pathname.startsWith("/wallet");

  return (
    <Button
      variant="ghost"
      className={clsx(
        "flex w-full items-center justify-start gap-3 rounded-xl px-3 py-2.5 transition-all",
        isActive
          ? "bg-primary/10 text-primary font-bold shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
      )}
      title="Citizen Wallet & Escrow Vault"
      asChild
    >
      <Link href="/wallet">
        <div className="relative">
          <Wallet className={clsx("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
        </div>
        <span className="hidden lg:inline text-sm">Wallet & Escrow</span>
      </Link>
    </Button>
  );
}
