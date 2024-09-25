"use server";

import { apiActionClient } from "@/lib/safe-action";
import { TPartialAppServiceSchema } from "@gws/api-client";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { PartialAppServiceSchemaMod } from "./schema";

const IdentifyApp = z.object({
  projectId: z.string().uuid(),
  appId: z.string().uuid(),
});

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
  .schema(PartialAppServiceSchemaMod)
  .action(
    async ({ parsedInput: app, bindArgsParsedInputs, ctx: { apiClient } }) => {
      const { publicDomain, ...partialApp } = app;
      const body: TPartialAppServiceSchema = partialApp;

      if (publicDomain != undefined) {
        body.publicDomain = {
          subdomain: publicDomain.length > 0 ? publicDomain : undefined,
        };
      }

      const res = await apiClient.updateApp(body, {
        params: {
          project_id: bindArgsParsedInputs[0],
          app_id: bindArgsParsedInputs[1],
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
