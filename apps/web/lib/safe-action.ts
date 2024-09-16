import {
  BindArgsValidationErrors,
  createSafeActionClient,
  SafeActionResult,
  ValidationErrors,
} from "next-safe-action";
import { apiClient } from "./api";
import { ErrorMessage, TErrorMessage } from "@gws/api-client";
import { Schema } from "next-safe-action/adapters/types";
import axios from "axios";
import { z } from "zod";

export class ServerError extends Error {
  public readonly kind: TErrorMessage["kind"];
  public readonly action: string;

  constructor(actionName: string, { kind, message }: TErrorMessage) {
    super(message);
    this.name = `ServerError from "${actionName}"`;
    this.kind = kind;
    this.action = actionName;
  }
}

export const apiActionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({ name: z.string() });
  },
  handleServerError(err, { metadata: { name } }) {
    if (axios.isAxiosError(err) && err.response) {
      return new ServerError(name, ErrorMessage.parse(err.response.data));
    }
    return new ServerError(name, {
      kind: "InternalError",
      message: err.message,
    });
  },
}).use(async ({ next }) => {
  return next({ ctx: { apiClient } });
});

export function unwrap<
  ServerError,
  S extends Schema | undefined,
  BAS extends readonly Schema[],
  CVE = ValidationErrors<S>,
  CBAVE = BindArgsValidationErrors<BAS>,
  Data = unknown,
  NextCtx = object,
>(
  result:
    | SafeActionResult<ServerError, S, BAS, CVE, CBAVE, Data, NextCtx>
    | undefined
): Data {
  if (!result || !result.data) {
    throw new Error("Internal server error: data not found");
  }

  return result.data;
}
