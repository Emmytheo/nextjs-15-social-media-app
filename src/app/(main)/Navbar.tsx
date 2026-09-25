"use client";

import NavbarWalletPill from "@/components/NavbarWalletPill";
import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Plus,
  FileEdit,
  Coins,
  Calendar,
  Building2,
  Sparkles,
  Music2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useMenuBar } from "@/components/MenuBarContext";

export default function Navbar() {
  const pathname = usePathname();
  const { isMenuBarVisible, toggleMenuBar } = useMenuBar();

  const navLinks = [
    { label: "Feed", href: "/", active: pathname === "/" },
    { label: "Crowdfunding", href: "/crowdfunding", active: pathname.startsWith("/crowdfunding") },
    { label: "Events", href: "/events", active: pathname.startsWith("/events") },
    { label: "Communities", href: "/organization", active: pathname.startsWith("/organization") },
    { label: "Music Studio", href: "/music", active: pathname.startsWith("/music") },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        {/* Brand & Left Nav */}
        <div className="flex items-center gap-2.5 sm:gap-4 md:gap-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenuBar}
            className="hidden sm:inline-flex h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0 active:scale-95"
            title={isMenuBarVisible ? "Collapse Sidebar (Ctrl+B)" : "Expand Sidebar (Ctrl+B)"}
            aria-label="Toggle Sidebar Menu"
          >
            <div className="relative size-5 flex items-center justify-center">
              <PanelLeftClose
                className={clsx(
                  "size-5 transition-all duration-300 absolute",
                  isMenuBarVisible ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 -rotate-90 pointer-events-none"
                )}
              />
              <PanelLeftOpen
                className={clsx(
                  "size-5 text-primary transition-all duration-300 absolute",
                  !isMenuBarVisible ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 rotate-90 pointer-events-none"
                )}
              />
            </div>
          </Button>

          <Link href="/" className="flex items-center gap-2.5 group" title="CommunityOS Home">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-amber-500 text-primary-foreground shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <span className="font-black text-sm">OS</span>
              <div className="absolute -inset-0.5 rounded-xl bg-primary/20 blur-sm -z-10 group-hover:bg-primary/40 transition-colors" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent">
                  Community<span className="text-foreground">OS</span>
                </span>
                <span className="hidden sm:inline-flex text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  MFB Rails
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav Pills */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
                  link.active
                    ? "bg-primary/15 text-primary shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Section: Search, + Create Menu, Wallet Pill, User Profile */}
        <div className="flex flex-1 items-center justify-end gap-2.5 sm:gap-3">
          <div className="hidden sm:block">
            <SearchField />
          </div>

          {/* Quick Create Action Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="gap-1.5 rounded-xl text-xs font-bold shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 hidden sm:flex"
              >
                <Plus className="h-4 w-4" />
                <span>Create</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl">
              <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                Community Launcher
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <Link href="/">
                <DropdownMenuItem className="gap-2.5 rounded-xl py-2 cursor-pointer font-medium">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <FileEdit className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">New Feed Post</div>
                    <div className="text-[10px] text-muted-foreground">Share update with community</div>
                  </div>
                </DropdownMenuItem>
              </Link>

              <Link href="/crowdfunding/create">
                <DropdownMenuItem className="gap-2.5 rounded-xl py-2 cursor-pointer font-medium">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Coins className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Start Campaign</div>
                    <div className="text-[10px] text-muted-foreground">Milestone-backed crowdfunding</div>
                  </div>
                </DropdownMenuItem>
              </Link>

              <Link href="/events/create">
                <DropdownMenuItem className="gap-2.5 rounded-xl py-2 cursor-pointer font-medium">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Host Event</div>
                    <div className="text-[10px] text-muted-foreground">Meetup, summit or workshop</div>
                  </div>
                </DropdownMenuItem>
              </Link>

              <Link href="/organization">
                <DropdownMenuItem className="gap-2.5 rounded-xl py-2 cursor-pointer font-medium">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">New Guild / Org</div>
                    <div className="text-[10px] text-muted-foreground">Cooperative or community group</div>
                  </div>
                </DropdownMenuItem>
              </Link>

              <Link href="/music">
                <DropdownMenuItem className="gap-2.5 rounded-xl py-2 cursor-pointer font-medium">
                  <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
                    <Music2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Music Studio</div>
                    <div className="text-[10px] text-muted-foreground">Upload songs & audio library</div>
                  </div>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          <NavbarWalletPill />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
