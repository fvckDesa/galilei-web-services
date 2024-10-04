import { Layout, Page } from "@/lib/types";
import {
  Resource,
  ResourceActionButton,
  ResourceCloseButton,
  ResourceHeader,
  ResourceName,
  ResourceUpdateButtonContainer,
} from "@/components/resource";
import { Container, Trash2, Undo2 } from "lucide-react";
import { cn, unwrap } from "@/lib/utils";
import { deleteApp, getApp, recoverApp } from "@/server-actions/app";
import { AppStatusLight } from "@/components/app-status-light";
import { TokenCookie } from "@/lib/cookies";
import { RenderSegment } from "@/components/segment-render";
import {
  SegmentTabs,
  SegmentTabsContent,
  SegmentTabsList,
  SegmentTabsTrigger,
} from "@/components/segment-tabs";

export default async function AppLayout({
  params: { projectId, appId },
  children,
}: Layout & Page<{ projectId: string; appId: string }>) {
  const app = await getApp({ projectId, appId }).then(unwrap);
  const token = TokenCookie.get()?.value ?? "";

  return (
    <Resource currentResource={app}>
      <ResourceHeader>
        <div
          className={cn(
            "flex items-center gap-2 w-full overflow-hidden",
            app.deleted && "text-destructive"
          )}
        >
          <AppStatusLight token={token} project={projectId} app={appId} />
          <Container className="size-6" />
          <ResourceName className="flex-1 overflow-hidden text-ellipsis text-nowrap">
            {app.name}
          </ResourceName>
        </div>
        <div className="flex items-center gap-2">
          <RenderSegment segment="(settings)">
            <ResourceUpdateButtonContainer />
          </RenderSegment>
          {app.deleted ? (
            <ResourceActionButton
              size="icon"
              icon={<Undo2 />}
              action={recoverApp}
              actionInputs={{ projectId, appId }}
              toastProps={{
                loading: `Recovering App ${app.name}...`,
                success: `App ${app.name} successfully recovered`,
                error: `Unable to recover App ${app.name}`,
              }}
            />
          ) : (
            <ResourceActionButton
              variant="destructive"
              size="icon"
              icon={<Trash2 />}
              action={deleteApp}
              actionInputs={{ projectId, appId }}
              toastProps={{
                loading: `Deleting App ${app.name}...`,
                success: `App ${app.name} successfully deleted`,
                error: `Unable to delete App ${app.name}`,
              }}
            />
          )}
          <ResourceCloseButton />
        </div>
      </ResourceHeader>
      <SegmentTabs className="flex flex-1 flex-col overflow-hidden">
        <div className="w-full p-4 pb-0">
          <SegmentTabsList className="w-full">
            <SegmentTabsTrigger
              className="flex-1"
              href={`/projects/${projectId}/apps/${appId}`}
            >
              Settings
            </SegmentTabsTrigger>
            <SegmentTabsTrigger
              className="flex-1"
              href={`/projects/${projectId}/apps/${appId}/env`}
              value="env"
            >
              Environment
            </SegmentTabsTrigger>
          </SegmentTabsList>
        </div>
        <SegmentTabsContent className="flex flex-1 flex-col overflow-hidden">
          {children}
        </SegmentTabsContent>
      </SegmentTabs>
    </Resource>
  );
}
