"use server";

import { apiActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ProjectSchema } from "@gws/api-client";

export const listUserProject = apiActionClient
  .metadata({ name: "listProjects" })
  .action(async ({ ctx: { apiClient } }) => await apiClient.listProjects());

export const createNewProject = apiActionClient
  .metadata({
    name: "createNewProject",
  })
  .schema(ProjectSchema)
  .action(async ({ parsedInput: project, ctx: { apiClient } }) => {
    const { id } = await apiClient.createProject(project);

    redirect(`projects/${id}`);
  });

export const getProject = apiActionClient
  .metadata({
    name: "getProject",
  })
  .schema(z.string().uuid())
  .action(
    async ({ parsedInput: id, ctx: { apiClient } }) =>
      await apiClient.getProject({ params: { project_id: id } })
  );

export const releaseProject = apiActionClient
  .metadata({ name: "releaseProject" })
  .schema(z.string().uuid())
  .action(async ({ parsedInput: projectId, ctx: { apiClient } }) => {
    await apiClient.releaseProject(undefined, {
      params: { project_id: projectId },
    });

    revalidateTag("apps-list");
    redirect(`/projects/${projectId}`);
  });
