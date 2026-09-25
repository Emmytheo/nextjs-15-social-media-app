"use client";

import { useMenuBar } from "./MenuBarContext";
import React from "react";
import { cn } from "@/lib/utils";

interface MenuBarWrapperProps {
  children: React.ReactNode;
}

export default function MenuBarWrapper({ children }: MenuBarWrapperProps) {
  const { isMenuBarVisible, isMounted } = useMenuBar();

  return (
    <aside
      aria-hidden={!isMenuBarVisible}
      className={cn(
        "sticky top-[5.25rem] hidden h-fit flex-none sm:block",
        "overflow-hidden will-change-[width,margin,opacity,transform]",
        // Transition activates after mounting to prevent layout stutter on page load
        isMounted && "transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
        isMenuBarVisible
          ? "sm:w-16 lg:w-60 xl:w-72 opacity-100 translate-x-0 mr-0 pointer-events-auto"
          : "w-0 max-w-0 opacity-0 -translate-x-6 -mr-5 pointer-events-none"
      )}
    >
      {/* Inner container maintains exact fixed dimensions so menu items never reflow or wrap while animating */}
      <div
        className={cn(
          "sm:w-16 lg:w-60 xl:w-72 space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm lg:px-4 border border-border/60",
          isMounted && "transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
          isMenuBarVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        {children}
      </div>
    </aside>
  );
}
