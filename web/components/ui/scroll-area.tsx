"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    overflowMarker?: boolean;
  }
>(({ className, children, overflowMarker = false, ...props }, ref) => {
  const [overflowOn, setOverflowOn] = React.useState<
    "top" | "bottom" | "both" | null
  >(null);

  const onScroll = React.useCallback((e: React.UIEvent<HTMLElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;

    if (scrollHeight <= clientHeight) {
      setOverflowOn(null);
    } else if (scrollTop === 0) {
      setOverflowOn("bottom");
    } else if (Math.abs(scrollHeight - clientHeight - scrollTop) <= 1) {
      setOverflowOn("top");
    } else {
      setOverflowOn("both");
    }
  }, []);

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        className={cn(
          "size-full rounded-[inherit] border-y-2 border-transparent transition-colors",
          overflowMarker && overflowOn === "top" && "border-t-border",
          overflowMarker && overflowOn === "both" && "border-y-border",
          overflowMarker && overflowOn === "bottom" && "border-b-border"
        )}
        onScroll={overflowMarker ? onScroll : undefined}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
