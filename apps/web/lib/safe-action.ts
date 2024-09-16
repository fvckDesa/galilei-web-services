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

export type ActionError = TErrorMessage & { action: string };

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

export class ActionServerError extends Error {
  public readonly kind: TErrorMessage["kind"];
  public readonly action: string;

  constructor({ kind, message, action }: ActionError) {
    super(message);
    this.name = `ActionError from "${action}"`;
    this.kind = kind;
    this.action = action;
  }
}

export function unwrap<
  ServerError extends ActionError,
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
    throw new ActionServerError(
      result?.serverError ?? {
        kind: "InternalError",
        message: "data not found when unwrap",
        action: "unknown",
      }
    );
  }

  return result.data;
}
