"use client";

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogTrigger,
} from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectForm } from "./project-form";
import { useState } from "react";
import { createNewProject } from "@/server-actions/project";

export function NewProject() {
  const [open, setOpen] = useState(false);

  function closeDialog() {
    setOpen(false);
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        <Button icon={<Plus />}>New Project</Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ProjectForm
          action={createNewProject}
          title="Create new Project"
          description="Group of resources belonging to the same project"
          submitBtn="Create"
          onCancel={closeDialog}
          onSuccess={closeDialog}
        />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
