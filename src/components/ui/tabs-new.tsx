"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-12 w-full items-center justify-center gap-1 rounded-md bg-card p-1 text-muted-foreground shadow-sm",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

interface ScrollableTabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  containerClassName?: string;
  showArrows?: boolean;
}

const ScrollableTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  ScrollableTabsListProps
>(({ className, containerClassName, showArrows = true, children, ...props }, ref) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  React.useImperativeHandle(ref, () => listRef.current as any);

  const checkScroll = React.useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  React.useEffect(() => {
    const el = listRef.current;
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

  const handleScroll = (direction: "left" | "right") => {
    const el = listRef.current;
    if (!el) return;
    const distance = Math.max(el.clientWidth * 0.6, 200);
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("relative group/scroll-tabs w-full flex items-center min-w-0", containerClassName)}>
      {showArrows && canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pr-3 pl-0.5 bg-gradient-to-r from-card via-card/90 to-transparent pointer-events-none rounded-l-xl">
          <button
            type="button"
            aria-label="Scroll tabs left"
            onClick={() => handleScroll("left")}
            className="pointer-events-auto h-7 w-7 rounded-full bg-background/95 hover:bg-background border border-border/80 shadow-md flex items-center justify-center text-foreground transition-all hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      <TabsPrimitive.List
        ref={listRef}
        className={cn(
          "inline-flex h-11 w-full items-center justify-start gap-1 overflow-x-auto no-scrollbar scrollbar-none scroll-smooth rounded-xl bg-card p-1 text-muted-foreground shadow-sm flex-nowrap",
          className,
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.List>

      {showArrows && canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pl-3 pr-0.5 bg-gradient-to-l from-card via-card/90 to-transparent pointer-events-none rounded-r-xl">
          <button
            type="button"
            aria-label="Scroll tabs right"
            onClick={() => handleScroll("right")}
            className="pointer-events-auto h-7 w-7 rounded-full bg-background/95 hover:bg-background border border-border/80 shadow-md flex items-center justify-center text-foreground transition-all hover:scale-105 active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
});
ScrollableTabsList.displayName = "ScrollableTabsList";

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-full flex-1 shrink-0 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:font-bold data-[state=active]:text-foreground",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, ScrollableTabsList, TabsTrigger };
