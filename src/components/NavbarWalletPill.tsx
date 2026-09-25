"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NavbarWalletPill() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/wallet")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.wallet) {
          setBalance(data.wallet.balance);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  if (balance === null) return null;

  return (
    <Link href="/wallet" className="group">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all hover:shadow-sm">
        <div className="p-1 rounded-full bg-primary/20 text-primary">
          <Wallet className="h-3.5 w-3.5" />
        </div>
        <span className="font-mono font-bold text-xs text-foreground group-hover:text-primary transition-colors">
          ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <Badge variant="outline" className="hidden lg:inline-flex text-[9px] px-1 py-0 h-4 uppercase font-bold text-primary border-primary/30">
          Vault
        </Badge>
      </div>
    </Link>
  );
}
