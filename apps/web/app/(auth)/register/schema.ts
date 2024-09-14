import { AuthData } from "@gws/api-client";
import { z } from "zod";

export const RegisterSchema = AuthData.and(
  z.object({ confirm: z.string() })
).refine((data) => data.password === data.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
});

export type RegisterData = z.infer<typeof RegisterSchema>;
