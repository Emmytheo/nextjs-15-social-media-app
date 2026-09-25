"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface MenuBarContextType {
  isMenuBarVisible: boolean;
  isMounted: boolean;
  toggleMenuBar: () => void;
  setMenuBarVisible: (visible: boolean) => void;
}

const MenuBarContext = createContext<MenuBarContextType | undefined>(undefined);

const STORAGE_KEY = "communityos_menubar_visible";

export function MenuBarProvider({ children }: { children: React.ReactNode }) {
  const [isMenuBarVisible, setIsMenuBarVisible] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsMenuBarVisible(saved === "true");
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  const toggleMenuBar = () => {
    setIsMenuBarVisible((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const setMenuBarVisible = (visible: boolean) => {
    setIsMenuBarVisible(visible);
    try {
      localStorage.setItem(STORAGE_KEY, String(visible));
    } catch {}
  };

  // Listen for Ctrl+B or Cmd+B shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        // Only toggle if not inside an input/textarea
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA" && !(e.target as HTMLElement)?.isContentEditable) {
          e.preventDefault();
          toggleMenuBar();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <MenuBarContext.Provider
      value={{
        isMenuBarVisible: isMounted ? isMenuBarVisible : true,
        isMounted,
        toggleMenuBar,
        setMenuBarVisible,
      }}
    >
      {children}
    </MenuBarContext.Provider>
  );
}

export function useMenuBar() {
  const context = useContext(MenuBarContext);
  if (!context) {
    throw new Error("useMenuBar must be used within a MenuBarProvider");
  }
  return context;
}
