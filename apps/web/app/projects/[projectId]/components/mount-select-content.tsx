import { listApps } from "@/server-actions/app";
import { ComponentPropsWithoutRef, ReactNode } from "react";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { unwrap } from "@/lib/utils";
import { listVolumes } from "@/server-actions/volume";
import { TAppService } from "@gws/api-client";

type MountSelectContentProps = ComponentPropsWithoutRef<
  typeof SelectContent
> & {
  renderItem?: (app: TAppService) => ReactNode;
  projectId: string;
};

function defaultItemRender(app: TAppService) {
  return (
    <SelectItem key={app.id} value={app.id}>
      {app.name}
    </SelectItem>
  );
}

export async function MountSelectContent({
  projectId,
  renderItem = defaultItemRender,
  ...props
}: MountSelectContentProps) {
  const apps = await listApps(projectId).then(unwrap);
  const volumes = await listVolumes(projectId).then(unwrap);

  const appsWithoutVolume = apps.filter(
    (app) => !volumes.find((volume) => app.id === volume.appId)
  );

  return (
    <SelectContent {...props}>
      {appsWithoutVolume.map(renderItem)}
    </SelectContent>
  );
}
