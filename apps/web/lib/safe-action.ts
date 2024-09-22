import { createSafeActionClient } from "next-safe-action";
import { apiClient } from "./api";
import { ErrorMessage } from "@gws/api-client";
import axios from "axios";
import { z } from "zod";
import { ActionError } from "./utils";

export const apiActionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({ name: z.string() });
  },
  handleServerError(err, { metadata: { name } }) {
    if (axios.isAxiosError(err) && err.response) {
      return {
        action: name,
        ...ErrorMessage.parse(err.response.data),
      } as ActionError;
    }
    return {
      action: name,
      kind: "InternalError",
      message: err.message,
    } as ActionError;
  },
}).use(async ({ next }) => {
  return next({ ctx: { apiClient } });
});
