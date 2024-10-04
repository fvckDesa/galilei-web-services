"use client";

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogTrigger,
} from "@/components/responsive-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Boxes, PencilRuler, SquarePen, Trash2 } from "lucide-react";
import Link from "next/link";
import { ProjectForm } from "./project-form";
import { toast } from "sonner";
import { deleteProject, updateProject } from "@/server-actions/project";
import { unwrap } from "@/lib/utils";
import { useState } from "react";

export interface ProjectProps {
  id: string;
  name: string;
}

export function Project({ id, name }: ProjectProps) {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <li className="h-fit w-[min(20rem,100%)] overflow-hidden rounded-md font-semibold">
      <ResponsiveDialog open={open} onOpenChange={setOpen}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <Link
              href={`/projects/${id}`}
              className="flex size-full items-center gap-4 rounded-[inherit] border-2 border-border bg-secondary px-6 py-4 transition-colors hover:bg-secondary/40 focus-visible:border-primary focus-visible:outline-none"
            >
              <PencilRuler />
              <span className="flex-1 overflow-hidden text-ellipsis text-nowrap">
                {name}
              </span>
            </Link>
          </ContextMenuTrigger>
          <ContextMenuContent className="min-w-60">
            <ContextMenuItem className="flex items-center gap-2" asChild>
              <Link href={`/projects/${id}/`}>
                <Boxes className="size-4" />
                <span>View project</span>
              </Link>
            </ContextMenuItem>
            <ResponsiveDialogTrigger asChild>
              <ContextMenuItem className="flex items-center gap-2">
                <SquarePen className="size-4" />
                <span>Update project</span>
              </ContextMenuItem>
            </ResponsiveDialogTrigger>
            <ContextMenuItem
              className="flex w-full items-center gap-2 text-destructive hover:text-destructive focus:text-destructive"
              onClick={() =>
                toast.promise(deleteProject(id).then(unwrap), {
                  loading: "Deleting project...",
                  success(project) {
                    return `Project ${project.name} successfully deleted`;
                  },
                  error: "Error occurred when delinting project",
                })
              }
            >
              <Trash2 className="size-4" />
              <span>Delete project</span>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <ResponsiveDialogContent>
          <ProjectForm
            title={`Project ${name}`}
            description="Update project settings"
            submitBtn="Update"
            name={name}
            action={updateProject.bind(null, id)}
            onCancel={close}
            onSuccess={close}
          />
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </li>
  );
}
