"use server";

import { apiActionClient } from "@/lib/safe-action";
import { EnvSchema } from "@gws/api-client";
import { z } from "zod";
import { IdentifyApp } from "./common";
import { revalidateTag } from "next/cache";

export const getAppEnvs = apiActionClient
  .metadata({ name: "getAppEnvs" })
  .schema(IdentifyApp)
  .action(async ({ parsedInput: { projectId, appId }, ctx: { apiClient } }) => {
    return await apiClient.listEnvs({
      params: {
        project_id: projectId,
        app_id: appId,
      },
      fetchOptions: { next: { tags: ["envs"] } },
    });
  });

export const createAppEnv = apiActionClient
  .metadata({ name: "createAppEnv" })
  .bindArgsSchemas<[projectId: z.ZodString, appId: z.ZodString]>([
    z.string().uuid(),
    z.string().uuid(),
  ])
  .schema(EnvSchema)
  .action(
    async ({
      parsedInput: env,
      bindArgsParsedInputs: [projectId, appId],
      ctx: { apiClient },
    }) => {
      const newEnv = await apiClient.createEnv(env, {
        params: { project_id: projectId, app_id: appId },
      });

      revalidateTag("envs");

      return newEnv;
    }
  );

export const updateAppEnv = apiActionClient
  .metadata({ name: "updateAppEnv" })
  .bindArgsSchemas<
    [projectId: z.ZodString, appId: z.ZodString, envId: z.ZodString]
  >([z.string().uuid(), z.string().uuid(), z.string().uuid()])
  .schema(EnvSchema)
  .action(
    async ({
      parsedInput: env,
      bindArgsParsedInputs: [projectId, appId, envId],
      ctx: { apiClient },
    }) => {
      const updatedEnv = await apiClient.updateEnv(env, {
        params: { project_id: projectId, app_id: appId, env_id: envId },
      });

      revalidateTag("envs");

      return updatedEnv;
    }
  );

const IdentifyEnv = IdentifyApp.extend({
  envId: z.string().uuid(),
});
export const deleteAppEnv = apiActionClient
  .metadata({ name: "deleteAppEnv" })
  .schema(IdentifyEnv)
  .action(
    async ({
      parsedInput: { projectId, appId, envId },
      ctx: { apiClient },
    }) => {
      const deletedEnv = await apiClient.deleteEnv(undefined, {
        params: { project_id: projectId, app_id: appId, env_id: envId },
      });

      revalidateTag("envs");

      return deletedEnv;
    }
  );
