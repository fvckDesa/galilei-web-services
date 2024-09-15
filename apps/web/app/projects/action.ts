"use server";

import { apiActionClient, withApiResult } from "@/lib/safe-action";

export const listUserProject = apiActionClient.action(
  withApiResult({
    alias: "listProjects",
    async action({ ctx: { apiClient } }) {
      return apiClient.listProjects();
    },
  })
);
