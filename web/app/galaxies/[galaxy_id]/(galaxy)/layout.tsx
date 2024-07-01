"use client";

import { Layout } from "@/lib/types";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useSelectedLayoutSegment } from "next/navigation";

export default function GalaxyLayout({ children, details }: Layout<"details">) {
  const segment = useSelectedLayoutSegment("details");
  const galaxyPanelDefaultSize = segment === "children" ? 60 : 100;

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        id="galaxy"
        minSize={30}
        defaultSize={galaxyPanelDefaultSize}
        order={1}
      >
        {children}
      </ResizablePanel>
      {segment === "children" && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel id="details" minSize={30} defaultSize={40} order={2}>
            {details}
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
