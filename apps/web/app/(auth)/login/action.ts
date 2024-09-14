"use server";

import { actionClient, createErrorResult } from "@/lib/safe-action";
import { TokenCookie } from "@/lib/cookies";
import { AuthData } from "@gws/api-client";
import { redirect } from "next/navigation";

export const loginAction = actionClient
  .schema(AuthData)
  .action(async ({ parsedInput: authData, ctx: { apiClient } }) => {
    try {
      const res = await apiClient.login(authData);

      TokenCookie.set({
        value: res.token,
        expires: res.expires,
      });
    } catch (error) {
      return createErrorResult("login", error);
    }
    redirect("/projects");
  });
