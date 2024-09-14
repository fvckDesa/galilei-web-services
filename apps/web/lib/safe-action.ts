import { createSafeActionClient } from "next-safe-action";
import { apiClient } from "./api";
import { isErrorFromAlias } from "@zodios/core";
import { TErrorMessage } from "@gws/api-client";

export const actionClient = createSafeActionClient().use(async ({ next }) =>
  next({ ctx: { apiClient } })
);

export function createErrorResult(
  alias: (typeof apiClient.api)[number]["alias"],
  error: unknown
) {
  if (isErrorFromAlias(apiClient.api, alias, error)) {
    return { error: error.response.data };
  }
  return {
    error: {
      kind: "InternalError",
      message: "Internal server error",
    } as TErrorMessage,
  };
}
