"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Coins, PlusCircle, Wallet, Bell, Building2, Calendar } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  unreadNotificationsCount?: number;
}

export default function MobileNav({ unreadNotificationsCount = 0 }: MobileNavProps) {
  const pathname = usePathname();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border/70 bg-card/95 px-2 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 sm:hidden">
      {/* Home */}
      <Link
        href="/"
        className={clsx(
          "flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors",
          pathname === "/" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Home className="h-5 w-5" />
        <span>Feed</span>
      </Link>

      {/* Crowdfunding */}
      <Link
        href="/crowdfunding"
        className={clsx(
          "flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors",
          pathname.startsWith("/crowdfunding") ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Coins className="h-5 w-5" />
        <span>Grants</span>
      </Link>

      {/* Quick Create Launcher Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <button
            className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-amber-500 text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-90"
            title="Create New"
          >
            <PlusCircle className="h-6 w-6" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center font-bold">Quick Create</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2.5 pt-2">
            <Link href="/" onClick={() => setCreateOpen(false)}>
              <Button variant="outline" className="w-full justify-start gap-3 rounded-xl py-5 text-sm font-semibold">
                <span className="p-1 rounded-lg bg-primary/10 text-primary">📝</span>
                New Community Post
              </Button>
            </Link>
            <Link href="/crowdfunding/create" onClick={() => setCreateOpen(false)}>
              <Button variant="outline" className="w-full justify-start gap-3 rounded-xl py-5 text-sm font-semibold">
                <span className="p-1 rounded-lg bg-amber-500/10 text-amber-600">🚀</span>
                Start Crowdfunding Campaign
              </Button>
            </Link>
            <Link href="/events/create" onClick={() => setCreateOpen(false)}>
              <Button variant="outline" className="w-full justify-start gap-3 rounded-xl py-5 text-sm font-semibold">
                <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-600">📅</span>
                Host Community Event
              </Button>
            </Link>
            <Link href="/organization" onClick={() => setCreateOpen(false)}>
              <Button variant="outline" className="w-full justify-start gap-3 rounded-xl py-5 text-sm font-semibold">
                <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600">🏛️</span>
                Create Guild or Cooperative
              </Button>
            </Link>
            <Link href="/music" onClick={() => setCreateOpen(false)}>
              <Button variant="outline" className="w-full justify-start gap-3 rounded-xl py-5 text-sm font-semibold">
                <span className="p-1 rounded-lg bg-pink-500/10 text-pink-600">🎵</span>
                Music Studio & Library
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wallet */}
      <Link
        href="/wallet"
        className={clsx(
          "flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors",
          pathname.startsWith("/wallet") ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Wallet className="h-5 w-5" />
        <span>Vault</span>
      </Link>

      {/* Notifications */}
      <Link
        href="/notifications"
        className={clsx(
          "relative flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors",
          pathname.startsWith("/notifications") ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <div className="relative">
          <Bell className="h-5 w-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
              {unreadNotificationsCount}
            </span>
          )}
        </div>
        <span>Alerts</span>
      </Link>
    </nav>
  );
}
