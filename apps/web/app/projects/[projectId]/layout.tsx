import { Layout, Page } from "@/lib/types";
import { getProject } from "@/server-actions/project";
import { unwrap } from "@/lib/utils";
import { CreateBtn } from "./components/create-btn";
import Resources from "./components/resources";
import { ResponsiveLayout } from "./components/responsive-layout";
import { ReleaseBtn } from "./components/release-btn";
import Link from "next/link";
import { FolderPen } from "lucide-react";

type ProjectLayoutProps = Layout & Page<{ projectId: string }>;

export default async function ProjectLayout({
  params: { projectId },
  children,
}: ProjectLayoutProps) {
  const project = await getProject(projectId).then(unwrap);

  return (
    <div className="flex size-full flex-col">
      <header className="flex items-center justify-between border-b-2 border-border px-8 py-4 text-2xl">
        <div className="flex flex-1 items-center gap-3 overflow-hidden">
          <Link href="/projects">
            <FolderPen />
          </Link>
          <span>/</span>
          <h1 className="flex-1 overflow-hidden text-ellipsis text-nowrap">
            {project.name}
          </h1>
        </div>
        <div className="hidden gap-4 sm:flex">
          <CreateBtn project={projectId} />
          <ReleaseBtn projectId={projectId} />
        </div>
      </header>
      <div className="flex justify-end gap-4 px-4 py-2 sm:hidden">
        <CreateBtn project={projectId} />
        <ReleaseBtn projectId={projectId} />
      </div>
      <div className="flex-1 overflow-hidden">
        <ResponsiveLayout
          projectId={projectId}
          resources={<Resources projectId={projectId} />}
        >
          {children}
        </ResponsiveLayout>
      </div>
    </div>
  );
}
