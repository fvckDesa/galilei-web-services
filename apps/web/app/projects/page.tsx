import { listUserProject } from "@/server-actions/project";
import { ScrollArea } from "@/components/ui/scroll-area";
import { unwrap } from "@/lib/utils";
import { NewProject } from "./new-project";
import { Project } from "./project";

export default async function ProjectsPage() {
  const projects = await listUserProject().then(unwrap);

  return (
    <div className="flex size-full flex-col gap-4 overflow-hidden p-12">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <NewProject />
      </div>
      <ScrollArea type="always" className="flex-1" overflowMarker>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-3 px-4">
          {projects.map(({ id, name }) => (
            <Project key={id} id={id} name={name} />
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
