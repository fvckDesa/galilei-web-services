"use server";

import { apiActionClient } from "@/lib/safe-action";
import { TokenCookie } from "@/lib/cookies";
import { AuthData } from "@gws/api-client";
import { redirect } from "next/navigation";

export const loginAction = apiActionClient
  .metadata({ name: "login" })
  .schema(AuthData)
  .action(async ({ parsedInput: authData, ctx: { apiClient } }) => {
    const { token, expires } = await apiClient.login(authData);

    TokenCookie.set({
      value: token,
      expires: expires,
    });

    redirect("/projects");
  });
