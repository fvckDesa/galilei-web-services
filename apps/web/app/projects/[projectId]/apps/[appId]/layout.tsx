import { Layout, Page } from "@/lib/types";
import {
  Resource,
  ResourceActionButton,
  ResourceCloseButton,
  ResourceContent,
  ResourceHeader,
  ResourceName,
  ResourceUpdateButton,
} from "@/components/resource";
import { Container, Trash2, Undo2 } from "lucide-react";
import { cn, unwrap } from "@/lib/utils";
import { deleteApp, getApp, recoverApp, updateApp } from "./actions";
import { AppResourceForm } from "./AppResourceForm";
import { AppStatusLight } from "@/components/app-status-light";
import { TokenCookie } from "@/lib/cookies";
import { AppTabs } from "./tab";

export default async function AppLayout({
  params: { projectId, appId },
  children,
}: Layout & Page<{ projectId: string; appId: string }>) {
  const app = await getApp({ projectId, appId }).then(unwrap);
  const token = TokenCookie.get()?.value ?? "";

  return (
    <Resource>
      <AppResourceForm
        updateAction={updateApp.bind(null, projectId, appId)}
        formProps={{
          defaultValues: {
            ...app,
            publicDomain: app.publicDomain ?? "",
          },
        }}
      >
        <ResourceHeader>
          <div
            className={cn(
              "flex items-center gap-2",
              app.deleted && "text-destructive"
            )}
          >
            <AppStatusLight token={token} project={projectId} app={appId} />
            <Container className="size-6" />
            <ResourceName>{app.name}</ResourceName>
          </div>
          <div className="flex items-center gap-2">
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
              <>
                <ResourceUpdateButton />
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
              </>
            )}
            <ResourceCloseButton />
          </div>
        </ResourceHeader>
        <AppTabs>
          <ResourceContent>
            <fieldset className="flex flex-col gap-4" disabled={app.deleted}>
              {children}
            </fieldset>
          </ResourceContent>
        </AppTabs>
      </AppResourceForm>
    </Resource>
  );
}
