import { listApps } from "@/server-actions/app";
import { getPublicUrl, unwrap } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Braces,
  Container,
  Settings,
  SquareArrowOutUpRight,
  Trash2,
  Undo2,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { DeleteAppItem, RecoverAppItem } from "./context-menu";
import { AppStatusLight } from "@/components/app-status-light";
import { TokenCookie } from "@/lib/cookies";
import { listVolumes } from "@/server-actions/volume";
import { TAppService, TVolume } from "@gws/api-client";
import { Volume } from "./volume";
import { MountSelectContent } from "./mount-select-content";

export interface ResourcesProps {
  projectId: string;
}

export default async function Resources({ projectId }: ResourcesProps) {
  const appsList = await listApps(projectId).then(unwrap);
  const volumesList = await listVolumes(projectId).then(unwrap);
  const token = TokenCookie.get()?.value ?? "";

  const { apps, volumes } = connectAppsAndVolumes(appsList, volumesList);

  return (
    <ScrollArea
      className="size-full px-8 py-4 [&>div>div[style]]:!block"
      type="auto"
    >
      <div className="flex size-full flex-col gap-4 sm:flex-row">
        <ul className="flex flex-1 flex-wrap justify-center gap-x-4 gap-y-3 px-4 py-2">
          {apps.map(({ app, volume }) => (
            <li
              key={app.id}
              className="h-fit w-[min(20rem,100%)] font-semibold"
            >
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <Link
                    className={cn(
                      "flex size-full rounded-md border-2 border-indigo-500 transition-colors bg-secondary hover:bg-secondary/40 items-center gap-4 px-6 py-4 focus-visible:border-primary focus-visible:outline-none",
                      app.deleted &&
                        "bg-destructive/30 hover:bg-destructive/20 border-destructive line-through decoration-2"
                    )}
                    href={`/projects/${projectId}/apps/${app.id}`}
                  >
                    <AppStatusLight
                      project={projectId}
                      app={app.id}
                      token={token}
                    />
                    <Container />
                    <span className="flex-1 overflow-hidden text-ellipsis text-nowrap">
                      {app.name}
                    </span>
                    <span>x {volume ? 1 : app.replicas}</span>
                  </Link>
                </ContextMenuTrigger>
                <ContextMenuContent className="min-w-60">
                  {app.publicDomain ? (
                    <ContextMenuItem
                      className="flex items-center gap-2"
                      asChild
                    >
                      <Link
                        href={getPublicUrl(app.publicDomain)}
                        target="_blank"
                      >
                        <SquareArrowOutUpRight className="size-4" />
                        <span>Open public url</span>
                      </Link>
                    </ContextMenuItem>
                  ) : null}
                  <ContextMenuItem className="flex items-center gap-2" asChild>
                    <Link href={`/projects/${projectId}/apps/${app.id}`}>
                      <Settings className="size-4" />
                      <span>View settings</span>
                    </Link>
                  </ContextMenuItem>
                  <ContextMenuItem className="flex items-center gap-2" asChild>
                    <Link href={`/projects/${projectId}/apps/${app.id}/env`}>
                      <Braces className="size-4" />
                      <span>View environment</span>
                    </Link>
                  </ContextMenuItem>
                  {app.deleted ? (
                    <RecoverAppItem
                      projectId={projectId}
                      appId={app.id}
                      className="flex items-center gap-2"
                    >
                      <Undo2 className="size-4" />
                      <span>Recover</span>
                    </RecoverAppItem>
                  ) : (
                    <DeleteAppItem
                      projectId={projectId}
                      appId={app.id}
                      className="flex w-full items-center gap-2 text-destructive hover:text-destructive focus:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      <span>Delete</span>
                    </DeleteAppItem>
                  )}
                </ContextMenuContent>
              </ContextMenu>
              {volume ? (
                <div className="size-full px-4">
                  <Volume volume={volume} className="rounded-b-md border-t-0" />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
        {volumes.length > 0 ? (
          <ul className="flex flex-1 flex-wrap justify-center gap-x-4 gap-y-3 px-4 py-2">
            {volumes.map((volume) => (
              <li
                key={volume.id}
                className="h-fit w-[min(20rem,100%)] font-semibold"
              >
                <Volume
                  volume={volume}
                  className="rounded-md"
                  mountSelectContent={
                    <MountSelectContent projectId={projectId} />
                  }
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </ScrollArea>
  );
}

interface AppsWithVolumes {
  apps: { app: TAppService; volume?: TVolume }[];
  volumes: TVolume[];
}

function connectAppsAndVolumes(
  apps: TAppService[],
  volumes: TVolume[]
): AppsWithVolumes {
  const connectedApps = [] as AppsWithVolumes["apps"];
  const orphanVolumes = [] as AppsWithVolumes["volumes"];
  for (const volume of volumes) {
    const appIdx = volume.appId
      ? apps.findIndex((app) => app.id === volume.appId)
      : undefined;
    if (appIdx != undefined) {
      const app = apps.splice(appIdx, 1)[0];
      if (!app) {
        throw new Error("Missing app");
      }
      connectedApps.push({ app, volume });
    } else {
      orphanVolumes.push(volume);
    }
  }

  return {
    apps: connectedApps.concat(apps.map((app) => ({ app }))),
    volumes: orphanVolumes,
  };
}
