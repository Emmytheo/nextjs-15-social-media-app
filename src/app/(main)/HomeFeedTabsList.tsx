"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface Org {
  id: string;
  name: string;
  logoUrl?: string | null;
}

interface HomeFeedTabsListProps {
  userOrganizations: Org[];
}

export default function HomeFeedTabsList({ userOrganizations }: HomeFeedTabsListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();

    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(() => {
      checkScroll();
    });
    ro.observe(el);
    Array.from(el.children).forEach((child) => ro.observe(child));
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = Math.max(el.clientWidth * 0.6, 200);
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const handleTabClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  return (
    <div className="relative sticky top-[70px] z-10 w-full rounded-2xl border border-border/70 bg-card/95 p-1.5 backdrop-blur-md shadow-sm min-w-0">
      {/* Left scroll button & gradient fade */}
      {canScrollLeft && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-card via-card/80 to-transparent rounded-l-2xl z-10" />
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-background/95 hover:bg-background border border-border/80 shadow-md flex items-center justify-center text-foreground hover:scale-105 active:scale-95 transition-all"
            aria-label="Scroll tabs left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Main Tabs List */}
      <TabsList
        ref={scrollRef}
        className="flex w-full h-auto items-center justify-start gap-1.5 bg-transparent p-0 overflow-x-auto no-scrollbar scrollbar-none scroll-smooth flex-nowrap"
      >
        <TabsTrigger
          value="for-you"
          onClick={handleTabClick}
          className="shrink-0 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
        >
          For You
        </TabsTrigger>
        <TabsTrigger
          value="following"
          onClick={handleTabClick}
          className="shrink-0 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
        >
          Following
        </TabsTrigger>

        {/* Divider if organizations exist */}
        {userOrganizations.length > 0 && (
          <div className="h-5 w-px bg-border/70 mx-1 shrink-0" aria-hidden="true" />
        )}

        {/* Render a tab for each user organization */}
        {userOrganizations.map((org) => (
          <TabsTrigger
            key={org.id}
            value={`org-${org.id}`}
            onClick={handleTabClick}
            className="shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all group"
            title={org.name}
          >
            {org.logoUrl ? (
              <Image
                src={org.logoUrl}
                alt={org.name}
                width={16}
                height={16}
                className="rounded-md object-cover size-4 shrink-0"
              />
            ) : (
              <Shield className="size-3.5 shrink-0 opacity-70 group-data-[state=active]:opacity-100" />
            )}
            <span className="max-w-[160px] truncate">{org.name}</span>
          </TabsTrigger>
        ))}

        {userOrganizations.length === 0 && (
          <TabsTrigger
            value="explore-guilds"
            onClick={handleTabClick}
            className="shrink-0 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
          >
            Guilds
          </TabsTrigger>
        )}
      </TabsList>

      {/* Right scroll button & gradient fade */}
      {canScrollRight && (
        <>
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-card via-card/80 to-transparent rounded-r-2xl z-10" />
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-background/95 hover:bg-background border border-border/80 shadow-md flex items-center justify-center text-foreground hover:scale-105 active:scale-95 transition-all"
            aria-label="Scroll tabs right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
