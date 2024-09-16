import { Button } from "@/components/ui/button";
import { listUserProject } from "./action";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { unwrap } from "@/lib/safe-action";

export default async function ProjectsPage() {
  const projects = await listUserProject().then(unwrap);

  return (
    <div className="flex size-full flex-col gap-4 overflow-hidden p-12">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <Button className="flex gap-2">
          <Plus className="size-4" />
          <span>New Project</span>
        </Button>
      </div>
      <ScrollArea type="always" className="flex-1" overflowMarker>
        <ul className="grid gap-x-4 gap-y-3 p-4 grid-auto-fill-60 md:grid-auto-fill-96">
          {projects.map(({ id, name }) => (
            <li
              key={id}
              className="rounded-md border border-border transition-colors hover:bg-secondary/80"
            >
              <Link
                href={`/projects/${id}`}
                className="block size-full px-6 py-4"
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
