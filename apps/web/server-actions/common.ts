import { z } from "zod";

export const IdentifyApp = z.object({
  projectId: z.string().uuid(),
  appId: z.string().uuid(),
});
