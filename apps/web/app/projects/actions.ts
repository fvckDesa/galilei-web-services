"use server";

import { apiClient } from "@/lib/api";
import { apiActionClient } from "@/lib/safe-action";
import { ProjectSchema } from "@gws/api-client";
import { redirect } from "next/navigation";

export const listUserProject = apiActionClient
  .metadata({ name: "listProjects" })
  .action(async () => await apiClient.listProjects());

export const createNewProject = apiActionClient
  .metadata({
    name: "createNewProject",
  })
  .schema(ProjectSchema)
  .action(async ({ parsedInput: project, ctx: { apiClient } }) => {
    const { id } = await apiClient.createProject(project);

    redirect(`projects/${id}`);
  });
