import { listApps } from "./actions";
import { unwrap } from "@/lib/safe-action";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ResourcesProps {
  projectId: string;
}

export default async function Resources({ projectId }: ResourcesProps) {
  const apps = await listApps(projectId).then(unwrap);

  return (
    <ScrollArea className="px-8 py-4" type="auto">
      <ul className="grid gap-x-4 gap-y-3 px-4 grid-auto-fill-60 md:grid-auto-fill-96">
        {apps.available
          .concat(...apps.deleted)
          .map(({ id: appId, name, deleted }) => (
            <li
              key={appId}
              className={cn(
                "overflow-hidden rounded-md border border-border transition-colors bg-secondary hover:bg-secondary/60",
                deleted &&
                  "border-destructive bg-destructive hover:bg-destructive/80 text-white opacity-40"
              )}
            >
              {deleted ? (
                <p key={appId} className="block px-6 py-4">
                  {name}
                </p>
              ) : (
                <Link
                  className="block px-6 py-4"
                  href={`/projects/${projectId}/apps/${appId}`}
                >
                  {name}
                </Link>
              )}
            </li>
          ))}
      </ul>
    </ScrollArea>
  );
}
