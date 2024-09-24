import { TErrorMessage } from "@gws/api-client";
import { clsx, type ClassValue } from "clsx";
import { env } from "next-runtime-env";
import {
  BindArgsValidationErrors,
  SafeActionResult,
  ValidationErrors,
} from "next-safe-action";
import { twMerge } from "tailwind-merge";
import { Schema } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ActionError = TErrorMessage & { action: string };

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
  if (
    !result ||
    (!result.data &&
      (result.serverError ||
        result.validationErrors ||
        result.bindArgsValidationErrors))
  ) {
    throw new ActionServerError(
      result?.serverError ?? {
        kind: "InternalError",
        message: "data not found when unwrap",
        action: "unknown",
      }
    );
  }

  return result.data as Data;
}

export function getPublicUrl(subdomain: string): string {
  const HOST_DOMAIN = env("NEXT_PUBLIC_HOST_DOMAIN") ?? "localhost";
  const HOST_HTTPS_PORT = env("NEXT_PUBLIC_HOST_PORT") ?? "8443";

  return `https://${subdomain}.${HOST_DOMAIN}:${HOST_HTTPS_PORT}`;
}
