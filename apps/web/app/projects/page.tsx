import { listUserProject } from "@/server-actions/project";
import { ScrollArea } from "@/components/ui/scroll-area";
import { unwrap } from "@/lib/utils";
import { NewProject } from "./components/new-project";
import { Project } from "./components/project";

export default async function ProjectsPage() {
  const projects = await listUserProject().then(unwrap);

  return (
    <div className="flex size-full flex-col gap-4 overflow-hidden px-4 py-6 sm:p-12">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <NewProject />
      </div>
      <ScrollArea
        type="always"
        className="flex-1 [&>div>div[style]]:!block"
        overflowMarker
      >
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-3 px-4">
          {projects.map(({ id, name }) => (
            <Project key={id} id={id} name={name} />
          ))}
          <li className="h-[2000px]" />
        </ul>
      </ScrollArea>
    </div>
  );
}
