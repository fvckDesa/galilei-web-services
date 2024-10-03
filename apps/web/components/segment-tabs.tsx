"use client";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "./ui/tabs";
import { useSelectedLayoutSegment } from "next/navigation";
import Link from "next/link";

const ROOT_TAB = "(settings)" as const;

const SegmentTabs = forwardRef<
  ElementRef<typeof Tabs>,
  Omit<ComponentPropsWithoutRef<typeof Tabs>, "value">
>(({ ...props }, ref) => {
  const segment = useSelectedLayoutSegment() ?? ROOT_TAB;
  return <Tabs ref={ref} {...props} value={segment} defaultValue={ROOT_TAB} />;
});
SegmentTabs.displayName = "SegmentTabs";

const SegmentTabsTrigger = forwardRef<
  ElementRef<typeof Link>,
  ComponentPropsWithoutRef<typeof Link> & { value?: string }
>(({ value = ROOT_TAB, className, children, ...props }, ref) => {
  return (
    <TabsTrigger className={className} value={value} asChild>
      <Link
        ref={ref}
        tabIndex={0}
        className="block size-full rounded-[inherit]"
        {...props}
      >
        {children}
      </Link>
    </TabsTrigger>
  );
});
SegmentTabsTrigger.displayName = "SegmentTabsTrigger";

const SegmentTabsContent = forwardRef<
  ElementRef<typeof TabsContent>,
  Omit<ComponentPropsWithoutRef<typeof TabsContent>, "value">
>(({ ...props }, ref) => {
  const segment = useSelectedLayoutSegment() ?? ROOT_TAB;
  return <TabsContent ref={ref} tabIndex={-1} {...props} value={segment} />;
});
SegmentTabsContent.displayName = "SegmentTabsContent";

export {
  SegmentTabs,
  TabsList as SegmentTabsList,
  SegmentTabsTrigger,
  SegmentTabsContent,
};
