import { PartialAppServiceSchema } from "@gws/api-client";
import { z } from "zod";

export const PartialAppServiceSchemaMod = PartialAppServiceSchema.omit({
  publicDomain: true,
}).extend({
  publicDomain: z
    .string()
    .regex(/(^[a-zA-Z0-9]*$)|^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/),
});
