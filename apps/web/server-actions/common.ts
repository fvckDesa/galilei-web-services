import { z } from "zod";

export const IdentifyApp = z.object({
  projectId: z.string().uuid(),
  appId: z.string().uuid(),
});

export const IdentifyVolume = z.object({
  projectId: z.string().uuid(),
  volumeId: z.string().uuid(),
});
