"use client";

import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { ReactNode, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Screen, useScreenMediaQuery } from "@/hooks/screen-media-query";
import dynamic from "next/dynamic";
import {
  ResponsiveSheet,
  ResponsiveSheetContent,
  ResponsiveSheetDescription,
  ResponsiveSheetTitle,
} from "@/components/responsive-sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export interface ResponsiveRenderProps {
  always: ReactNode;
  matchScreen: ReactNode;
  children: ReactNode;
  screen?: Screen;
}

function ResponsiveRender({
  always,
  matchScreen,
  children,
  screen = "lg",
}: ResponsiveRenderProps) {
  const segment = useSelectedLayoutSegment();
  const isMatching = useScreenMediaQuery(screen);

  if (!segment) return always;

  if (isMatching) return matchScreen;

  return children;
}

const ResponsiveRenderNoSsr = dynamic(() => Promise.resolve(ResponsiveRender), {
  ssr: false,
});

export interface ResponsiveLayoutProps {
  projectId: string;
  resources: ReactNode;
  children: ReactNode;
  screen?: Screen;
}

export function ResponsiveLayout({
  resources,
  projectId,
  screen = "lg",
  children,
}: ResponsiveLayoutProps) {
  return (
    <ResponsiveRenderNoSsr
      screen={screen}
      always={resources}
      matchScreen={
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel minSize={45}>{resources}</ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            className="flex flex-col"
            minSize={30}
            defaultSize={40}
          >
            {children}
          </ResizablePanel>
        </ResizablePanelGroup>
      }
    >
      {resources}
      <FixedRender projectId={projectId}>{children}</FixedRender>
    </ResponsiveRenderNoSsr>
  );
}

function FixedRender({
  projectId,
  children,
}: {
  projectId: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        setTimeout(() => {
          router.push(`/projects/${projectId}`);
        }, 400);
      }}
      defaultOpen
    >
      <ResponsiveSheetContent
        className="flex min-h-[50%] flex-col overflow-hidden"
        sheetProps={{ className: "px-0", withCloseBtn: false }}
        drawerProps={{ className: "max-h-[80%]" }}
      >
        <VisuallyHidden>
          <ResponsiveSheetTitle>Resource</ResponsiveSheetTitle>
          <ResponsiveSheetDescription></ResponsiveSheetDescription>
        </VisuallyHidden>
        {children}
      </ResponsiveSheetContent>
    </ResponsiveSheet>
  );
}
