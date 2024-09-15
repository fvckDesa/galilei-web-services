"use server";

import { apiActionClient, withApiResult } from "@/lib/safe-action";
import { TokenCookie } from "@/lib/cookies";
import { AuthData } from "@gws/api-client";
import { redirect } from "next/navigation";

export const loginAction = apiActionClient.schema(AuthData).action(
  withApiResult({
    alias: "login",
    async action({ parsedInput: authData, ctx: { apiClient } }) {
      const { token, expires } = await apiClient.login(authData);

      TokenCookie.set({
        value: token,
        expires: expires,
      });

      redirect("/projects");
    },
  })
);
