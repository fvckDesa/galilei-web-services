"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useParams, useSelectedLayoutSegment } from "next/navigation";
import { ReactNode } from "react";

export function AppTabs({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment() ?? "generic";
  const { projectId, appId } = useParams<{
    projectId: string;
    appId: string;
  }>();

  return (
    <Tabs className="flex flex-1 flex-col overflow-hidden" value={segment}>
      <div className="w-full p-4">
        <TabsList className="w-full">
          <TabsTrigger className="flex-1" value="generic">
            <Link
              className="block size-full"
              href={`/projects/${projectId}/apps/${appId}`}
            >
              Generic
            </Link>
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="network">
            <Link
              className="block size-full"
              href={`/projects/${projectId}/apps/${appId}/network`}
            >
              Network
            </Link>
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent
        className="flex flex-1 flex-col overflow-hidden"
        value={segment}
      >
        {children}
      </TabsContent>
    </Tabs>
  );
}
