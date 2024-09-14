"use server";

import { actionClient, createErrorResult } from "@/lib/safe-action";
import { TokenCookie } from "@/lib/cookies";
import { RegisterSchema } from "./schema";
import { redirect } from "next/navigation";

export const registerAction = actionClient
  .schema(RegisterSchema)
  .action(
    async ({
      parsedInput: { confirm: _, ...AuthData },
      ctx: { apiClient },
    }) => {
      try {
        const res = await apiClient.register(AuthData);

        TokenCookie.set({
          value: res.token,
          expires: res.expires,
        });
      } catch (error) {
        return createErrorResult("register", error);
      }
      redirect("/projects");
    }
  );
