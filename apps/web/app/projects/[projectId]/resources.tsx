import { listApps } from "./actions";
import { unwrap } from "@/lib/safe-action";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export interface ResourcesProps {
  projectId: string;
}

export default async function Resources({ projectId }: ResourcesProps) {
  const apps = await listApps(projectId).then(unwrap);

  return (
    <ScrollArea className="px-8 py-4" type="auto">
      <ul className="grid gap-x-4 gap-y-3 px-4 grid-auto-fill-60 md:grid-auto-fill-96">
        {apps.map(({ id: appId, name }) => (
          <li
            key={appId}
            className="rounded-md border border-border transition-colors hover:bg-secondary/80"
          >
            <Link
              className="block px-6 py-4"
              href={`/projects/${projectId}/apps/${appId}`}
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
