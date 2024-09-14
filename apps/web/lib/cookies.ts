import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

class Cookie<const N extends string> {
  constructor(
    private name: N,
    private options: Partial<
      Omit<ResponseCookie, "name" | "value" | "expires">
    > = {}
  ) {}

  get() {
    return cookies().get(this.name);
  }

  set(
    values: Pick<ResponseCookie, "value"> &
      Partial<Pick<ResponseCookie, "expires" | "maxAge">>
  ) {
    return cookies().set({
      name: this.name,
      ...values,
      ...this.options,
    });
  }
}

export const TokenCookie = new Cookie("token", {
  domain: "localhost",
  path: "/",
  httpOnly: true,
  secure: true,
  sameSite: "strict",
});
