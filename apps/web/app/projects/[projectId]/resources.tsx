import { listApps } from "./actions";
import { unwrap } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Container, SquareArrowOutUpRight, Trash2, Undo2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { DeleteAppItem, RecoverAppItem } from "./context-menu";

export interface ResourcesProps {
  projectId: string;
}

export default async function Resources({ projectId }: ResourcesProps) {
  const apps = await listApps(projectId).then(unwrap);

  return (
    <ScrollArea className="size-full px-8 py-4" type="auto">
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-3 px-4 py-2">
        {apps.available
          .concat(...apps.deleted)
          .map(({ id: appId, name, deleted }) => (
            <li key={appId} className="w-80 rounded-md font-semibold">
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
                    <Container />
                    <span>{name}</span>
                  </Link>
                </ContextMenuTrigger>
                <ContextMenuContent className="min-w-60">
                  <ContextMenuItem className="flex items-center gap-2" asChild>
                    <Link href={`/projects/${projectId}/apps/${appId}`}>
                      <SquareArrowOutUpRight className="size-4" />
                      <span>Open</span>
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
