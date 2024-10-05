import { Layout, Page } from "@/lib/types";
import {
  Resource,
  ResourceActionButton,
  ResourceCloseButton,
  ResourceHeader,
  ResourceName,
  ResourceUpdateButtonContainer,
} from "@/components/resource";
import { HardDrive, PlugZap, Trash2, Undo2, Unplug } from "lucide-react";
import { cn, unwrap } from "@/lib/utils";
import {
  deleteVolume,
  getVolume,
  recoverVolume,
  updateVolume,
} from "@/server-actions/volume";
import { Mount } from "./components/mount";
import { MountSelectContent } from "../../components/mount-select-content";
import { Button } from "@/components/ui/button";

export default async function AppLayout({
  params: { projectId, volumeId },
  children,
}: Layout & Page<{ projectId: string; volumeId: string }>) {
  const volume = await getVolume({ projectId, volumeId }).then(unwrap);

  return (
    <Resource currentResource={volume}>
      <ResourceHeader>
        <div
          className={cn(
            "flex items-center gap-2 w-full overflow-hidden",
            volume.deleted && "text-destructive"
          )}
        >
          <HardDrive className="size-6" />
          <ResourceName className="flex-1 overflow-hidden text-ellipsis text-nowrap">
            {volume.name}
          </ResourceName>
        </div>
        <div className="flex items-center gap-2">
          <ResourceUpdateButtonContainer />
          {volume.deleted ? (
            <ResourceActionButton
              size="icon"
              icon={<Undo2 />}
              action={recoverVolume}
              actionInputs={{ projectId, volumeId }}
              toastProps={{
                loading: `Recovering Volume ${volume.name}...`,
                success: `Volume ${volume.name} successfully recovered`,
                error: `Unable to recover Volume ${volume.name}`,
              }}
            />
          ) : (
            <>
              {volume.appId ? (
                <ResourceActionButton
                  size="icon"
                  icon={<Unplug />}
                  action={updateVolume.bind(null, projectId, volumeId)}
                  actionInputs={{ app: { id: undefined } }}
                  toastProps={{
                    loading: `Disconnecting Volume ${volume.name}...`,
                    success: `Volume ${volume.name} successfully disconnected`,
                    error: `Unable to disconnect Volume ${volume.name}`,
                  }}
                />
              ) : (
                <Mount
                  volume={volume}
                  mountSelectContent={
                    <MountSelectContent projectId={projectId} />
                  }
                >
                  <Button size="icon" icon={<PlugZap />} />
                </Mount>
              )}
              <ResourceActionButton
                variant="destructive"
                size="icon"
                icon={<Trash2 />}
                action={deleteVolume}
                actionInputs={{ projectId, volumeId }}
                toastProps={{
                  loading: `Deleting Volume ${volume.name}...`,
                  success: `Volume ${volume.name} successfully deleted`,
                  error: `Unable to delete Volume ${volume.name}`,
                }}
              />
            </>
          )}
          <ResourceCloseButton />
        </div>
      </ResourceHeader>
      {children}
    </Resource>
  );
}
