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

export interface ResourcesProps {
  projectId: string;
}

export default async function Resources({ projectId }: ResourcesProps) {
  const apps = await listApps(projectId).then(unwrap);
  const token = TokenCookie.get()?.value ?? "";

  return (
    <ScrollArea
      className="size-full px-8 py-4 [&>div>div[style]]:!block"
      type="auto"
    >
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-3 px-4 py-2">
        {apps.available
          .concat(...apps.deleted)
          .map(({ id: appId, name, deleted, publicDomain }) => (
            <li
              key={appId}
              className="w-[min(20rem,100%)] rounded-md font-semibold"
            >
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <Link
                    className={cn(
                      "flex size-full border-2 border-border transition-colors bg-secondary hover:bg-secondary/40 items-center gap-4 px-6 py-4 focus-visible:border-primary rounded-[inherit] focus-visible:outline-none",
                      deleted &&
                        "bg-destructive/60 hover:bg-destructive/40 text-white border-destructive"
                    )}
                    href={`/projects/${projectId}/apps/${appId}`}
                  >
                    <AppStatusLight
                      project={projectId}
                      app={appId}
                      token={token}
                    />
                    <Container />
                    <span className="flex-1 overflow-hidden text-ellipsis text-nowrap">
                      {name}
                    </span>
                  </Link>
                </ContextMenuTrigger>
                <ContextMenuContent className="min-w-60">
                  {publicDomain ? (
                    <ContextMenuItem
                      className="flex items-center gap-2"
                      asChild
                    >
                      <Link href={getPublicUrl(publicDomain)} target="_blank">
                        <SquareArrowOutUpRight className="size-4" />
                        <span>Open public url</span>
                      </Link>
                    </ContextMenuItem>
                  ) : null}
                  <ContextMenuItem className="flex items-center gap-2" asChild>
                    <Link href={`/projects/${projectId}/apps/${appId}`}>
                      <Settings className="size-4" />
                      <span>View settings</span>
                    </Link>
                  </ContextMenuItem>
                  <ContextMenuItem className="flex items-center gap-2" asChild>
                    <Link href={`/projects/${projectId}/apps/${appId}/env`}>
                      <Braces className="size-4" />
                      <span>View environment</span>
                    </Link>
                  </ContextMenuItem>
                  {deleted ? (
                    <RecoverAppItem
                      projectId={projectId}
                      appId={appId}
                      className="flex items-center gap-2"
                    >
                      <Undo2 className="size-4" />
                      <span>Recover</span>
                    </RecoverAppItem>
                  ) : (
                    <DeleteAppItem
                      projectId={projectId}
                      appId={appId}
                      className="flex w-full items-center gap-2 text-destructive hover:text-destructive focus:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      <span>Delete</span>
                    </DeleteAppItem>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            </li>
          ))}
      </ul>
    </ScrollArea>
  );
}
