import { listUserProject } from "./actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { unwrap } from "@/lib/safe-action";
import { NewProjectDialog } from "./new-project-dialog";
import { PencilRuler } from "lucide-react";

export default async function ProjectsPage() {
  const projects = await listUserProject().then(unwrap);

  return (
    <div className="flex size-full flex-col gap-4 overflow-hidden p-12">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <NewProjectDialog />
      </div>
      <ScrollArea type="always" className="flex-1" overflowMarker>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-3 px-4">
          {projects.map(({ id, name }) => (
            <li
              key={id}
              className="w-80 overflow-hidden rounded-md border-2 border-primary bg-secondary font-semibold transition-colors hover:bg-secondary/40"
            >
              <Link
                href={`/projects/${id}`}
                className="flex size-full items-center gap-4 px-6 py-4"
              >
                <PencilRuler />
                <span>{name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
