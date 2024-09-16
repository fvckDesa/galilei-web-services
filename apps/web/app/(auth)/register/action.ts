"use server";

import { apiActionClient } from "@/lib/safe-action";
import { TokenCookie } from "@/lib/cookies";
import { RegisterSchema } from "./schema";
import { redirect } from "next/navigation";

export const registerAction = apiActionClient
  .metadata({
    name: "register",
  })
  .schema(RegisterSchema)
  .action(
    async ({
      parsedInput: { confirm: _, ...AuthData },
      ctx: { apiClient },
    }) => {
      const { token, expires } = await apiClient.register(AuthData);

      TokenCookie.set({
        value: token,
        expires: expires,
      });

      redirect("/projects");
    }
  );
