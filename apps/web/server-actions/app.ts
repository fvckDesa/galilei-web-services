"use server";
import { apiActionClient } from "@/lib/safe-action";
import { AppServiceSchema } from "@gws/api-client";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { IdentifyApp } from "./common";

export const listApps = apiActionClient
  .metadata({
    name: "listApps",
  })
  .schema(z.string().uuid())
  .action(async ({ parsedInput: projectId, ctx: { apiClient } }) => {
    const apps = await apiClient.listApps({
      params: { project_id: projectId },
      fetchOptions: { next: { tags: ["apps-list"] } },
    });

    return apps.reduce(
      (acc, app) => {
        if (app.deleted) {
          acc.deleted.push(app);
        } else {
          acc.available.push(app);
        }
        return acc;
      },
      { available: [], deleted: [] } as {
        available: typeof apps;
        deleted: typeof apps;
      }
    );
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

export const getApp = apiActionClient
  .metadata({ name: "getApp" })
  .schema(IdentifyApp)
  .action(async ({ parsedInput: { projectId, appId }, ctx: { apiClient } }) => {
    return await apiClient.getApp({
      params: {
        project_id: projectId,
        app_id: appId,
      },
      fetchOptions: { next: { tags: ["app"] } },
    });
  });

export const updateApp = apiActionClient
  .metadata({ name: "updateApp" })
  .bindArgsSchemas<[projectId: z.ZodString, appId: z.ZodString]>([
    z.string().uuid(),
    z.string().uuid(),
  ])
  .schema(AppServiceSchema)
  .action(
    async ({
      parsedInput: app,
      bindArgsParsedInputs: [projectId, appId],
      ctx: { apiClient },
    }) => {
      const res = await apiClient.updateApp(app, {
        params: {
          project_id: projectId,
          app_id: appId,
        },
      });

      revalidateTag("app");
      revalidateTag("apps-list");

      return res;
    }
  );

export const deleteApp = apiActionClient
  .metadata({ name: "deleteApp" })
  .schema(IdentifyApp)
  .action(async ({ parsedInput: { projectId, appId }, ctx: { apiClient } }) => {
    const app = await apiClient.deleteApp(undefined, {
      params: { project_id: projectId, app_id: appId },
    });

    revalidateTag("apps-list");
    revalidateTag("app");

    return app;
  });

export const recoverApp = apiActionClient
  .metadata({ name: "recoverApp" })
  .schema(IdentifyApp)
  .action(async ({ parsedInput: { projectId, appId }, ctx: { apiClient } }) => {
    await apiClient.recoverApp(undefined, {
      params: { project_id: projectId, app_id: appId },
    });

    revalidateTag("apps-list");
    revalidateTag("app");
  });
