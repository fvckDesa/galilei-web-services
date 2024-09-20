"use server";

import { apiActionClient } from "@/lib/safe-action";
import { z } from "zod";
import { AppServiceSchema } from "@gws/api-client";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

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
    return await apiClient.releaseProject(undefined, {
      params: { project_id: projectId },
    });
  });

export const listApps = apiActionClient
  .metadata({
    name: "listApps",
  })
  .schema(z.string().uuid())
  .action(async ({ parsedInput: id, ctx: { apiClient } }) => {
    return await apiClient.listApps({
      params: { project_id: id },
      fetchOptions: { next: { tags: ["apps-list"] } },
    });
  });

export const createApp = apiActionClient
  .metadata({ name: "createApp" })
  .schema(AppServiceSchema)
  .bindArgsSchemas([z.string().uuid()])
  .action(
    async ({
      parsedInput: app,
      bindArgsParsedInputs: [projectId],
      ctx: { apiClient },
    }) => {
      const newApp = await apiClient.createApp(app, {
        params: { project_id: projectId },
      });

      revalidateTag("apps-list");
      redirect(`/projects/${newApp.projectId}/apps/${newApp.id}`);
    }
  );
