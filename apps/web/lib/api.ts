import { createApiClient } from "@gws/api-client";
import { TokenCookie } from "./cookies";

export const apiClient = createApiClient(
  process.env.API_HOST ?? "http://localhost:8000",
  {
    validate: "response",
  }
);

apiClient.use({
  name: "token",
  async request(_, config) {
    const token = TokenCookie.get();

    if (!token) {
      return config;
    }

    return {
      ...config,
      headers: {
        ...config.headers,
        "X-Api-Key": token.value,
      },
    };
  },
});
