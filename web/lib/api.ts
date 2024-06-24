import { cookies } from "next/headers";
import { parse as parseSetCookies } from "set-cookie-parser";
import { ApiClient } from "api-client";

const SAME_SITE_VALUE = ["Lax", "Strict", "None"] as const;

type SameSite = (typeof SAME_SITE_VALUE)[number];

function isSameSite(str: string): str is SameSite {
  return SAME_SITE_VALUE.some((v) => v === str);
}

export const api = new ApiClient({
  baseUrl: process.env.API_URL ?? "http://localhost:8080",
});

api.client.use({
  onRequest(req) {
    req.headers.append("Cookie", cookies().toString());

    return req;
  },
  onResponse(res) {
    let resCookies = parseSetCookies(res.headers.getSetCookie());

    for (const { name, value, sameSite, ...options } of resCookies) {
      if (sameSite && isSameSite(sameSite)) {
        cookies().set(name, value, {
          sameSite: sameSite.toLowerCase() as Lowercase<SameSite>,
          ...options,
        });
      } else if (!sameSite) {
        cookies().set(name, value, options);
      } else {
        throw new Error("Invalid Same Site value");
      }
    }

    return res;
  },
});
