import { Layout, Page } from "@/lib/types";
import { getProject } from "@/server-actions/project";
import { unwrap } from "@/lib/utils";
import { CreateBtn } from "./create-btn";
import Resources from "./resources";
import { ResponsiveLayout } from "./responsive-layout";
import { ReleaseBtn } from "./release-btn";
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
        <div className="flex items-center gap-3">
          <Link href="/projects">
            <FolderPen />
          </Link>
          <span>/</span>
          <h1>{project.name}</h1>
        </div>
        <div className="flex gap-4">
          <CreateBtn project={projectId} />
          <ReleaseBtn projectId={projectId} />
        </div>
      </header>
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
