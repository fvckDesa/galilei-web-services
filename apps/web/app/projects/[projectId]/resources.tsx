import { listApps } from "./actions";
import { unwrap } from "@/lib/safe-action";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Container } from "lucide-react";

export interface ResourcesProps {
  projectId: string;
}

export default async function Resources({ projectId }: ResourcesProps) {
  const apps = await listApps(projectId).then(unwrap);

  return (
    <ScrollArea className="size-full px-8 py-4" type="auto">
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-3 px-4">
        {apps.available
          .concat(...apps.deleted)
          .map(({ id: appId, name, deleted }) => (
            <li
              key={appId}
              className={cn(
                "w-80 overflow-hidden rounded-md border-2 border-primary transition-colors bg-secondary hover:bg-secondary/40 font-semibold",
                deleted &&
                  "border-destructive bg-destructive hover:bg-destructive/80 text-white opacity-40"
              )}
            >
              {deleted ? (
                <p
                  key={appId}
                  className="flex size-full items-center gap-4 px-6 py-4"
                >
                  {name}
                </p>
              ) : (
                <Link
                  className="flex size-full items-center gap-4 px-6 py-4"
                  href={`/projects/${projectId}/apps/${appId}`}
                >
                  <Container />
                  <span>{name}</span>
                </Link>
              )}
            </li>
          ))}
      </ul>
    </ScrollArea>
  );
}
