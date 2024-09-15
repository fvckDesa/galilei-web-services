import { createSafeActionClient, ServerCodeFn } from "next-safe-action";
import { apiClient } from "./api";
import { isErrorFromAlias, ZodiosEndpointDefinition } from "@zodios/core";
import { TErrorMessage } from "@gws/api-client";
import { Schema } from "next-safe-action/adapters/types";
import { z } from "zod";

export const actionClient = createSafeActionClient({});

export const apiActionClient = actionClient.use(async ({ next }) => {
  return next({ ctx: { apiClient } });
});

type DataFromAlias<
  T extends ZodiosEndpointDefinition[],
  A extends NonNullable<T[number]["alias"]>,
> = {
  [K in NonNullable<T[number]["alias"]>]: z.infer<
    Extract<T[number], { alias: K }>["response"]
  >;
}[A];

export interface ApiResultParams<
  Alias extends (typeof apiClient.api)[number]["alias"],
  MD,
  Ctx extends object,
  S extends Schema | undefined,
  BAS extends readonly Schema[],
  Data extends DataFromAlias<typeof apiClient.api, Alias>,
  F extends ServerCodeFn<MD, Ctx, S, BAS, Data>,
> {
  alias: (typeof apiClient.api)[number]["alias"] extends Alias
    ? Alias
    : (typeof apiClient.api)[number]["alias"];
  action: F;
}

export function withApiResult<
  Alias extends (typeof apiClient.api)[number]["alias"],
  MD,
  Ctx extends object,
  S extends Schema | undefined,
  BAS extends readonly Schema[],
  Data extends DataFromAlias<typeof apiClient.api, Alias>,
  F extends ServerCodeFn<MD, Ctx, S, BAS, Data>,
>({
  alias,
  action,
}: ApiResultParams<Alias, MD, Ctx, S, BAS, Data, F>): ServerCodeFn<
  MD,
  Ctx,
  S,
  BAS,
  | {
      success: Data;
      error?: never;
    }
  | { success?: never; error: TErrorMessage }
> {
  return async function (args: Parameters<F>[0]) {
    try {
      const res = await action(args);
      return { success: res };
    } catch (error) {
      if (isErrorFromAlias(apiClient.api, alias, error)) {
        return { error: error.response.data };
      }
      throw error;
    }
  };
}
