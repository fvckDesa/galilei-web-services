"use server";

import { apiActionClient } from "@/lib/safe-action";
import { PartialVolumeSchema, VolumeSchema } from "@gws/api-client";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { IdentifyVolume } from "./common";

export const listVolumes = apiActionClient
  .metadata({
    name: "listVolumes",
  })
  .schema(z.string().uuid())
  .action(async ({ parsedInput: projectId, ctx: { apiClient } }) => {
    return await apiClient.listVolumes({
      params: { project_id: projectId },
      fetchOptions: { next: { tags: ["volumes-list"] } },
    });
  });

export const getVolume = apiActionClient
  .metadata({
    name: "getVolume",
  })
  .schema(IdentifyVolume)
  .action(
    async ({ parsedInput: { projectId, volumeId }, ctx: { apiClient } }) => {
      return await apiClient.getVolume({
        params: { project_id: projectId, volume_id: volumeId },
        fetchOptions: { next: { tags: ["volume"] } },
      });
    }
  );

export const createVolume = apiActionClient
  .metadata({
    name: "createVolume",
  })
  .bindArgsSchemas([z.string().uuid()])
  .schema(VolumeSchema)
  .action(
    async ({
      parsedInput: volume,
      bindArgsParsedInputs: [projectId],
      ctx: { apiClient },
    }) => {
      await apiClient.createVolume(volume, {
        params: { project_id: projectId },
        fetchOptions: { next: { tags: ["volumes-list"] } },
      });

      revalidateTag("volume-list");
    }
  );

export const updateVolume = apiActionClient
  .metadata({
    name: "updateVolume",
  })
  .bindArgsSchemas<[projectId: z.ZodString, volumeId: z.ZodString]>([
    z.string().uuid(),
    z.string().uuid(),
  ])
  .schema(PartialVolumeSchema)
  .action(
    async ({
      parsedInput: volume,
      bindArgsParsedInputs: [projectId, volumeId],
      ctx: { apiClient },
    }) => {
      await apiClient.updateVolume(volume, {
        params: { project_id: projectId, volume_id: volumeId },
      });

      revalidateTag("volume");
      revalidateTag("volume-list");
    }
  );

export const deleteVolume = apiActionClient
  .metadata({
    name: "deleteVolume",
  })
  .schema(IdentifyVolume)
  .action(
    async ({ parsedInput: { projectId, volumeId }, ctx: { apiClient } }) => {
      const volume = await apiClient.deleteVolume(undefined, {
        params: { project_id: projectId, volume_id: volumeId },
      });

      revalidateTag("volume");
      revalidateTag("volume-list");

      return volume;
    }
  );

export const recoverVolume = apiActionClient
  .metadata({
    name: "recoverVolume",
  })
  .schema(IdentifyVolume)
  .action(
    async ({ parsedInput: { projectId, volumeId }, ctx: { apiClient } }) => {
      const volume = await apiClient.recoverVolume(undefined, {
        params: { project_id: projectId, volume_id: volumeId },
      });

      revalidateTag("volume");
      revalidateTag("volume-list");

      return volume;
    }
  );
