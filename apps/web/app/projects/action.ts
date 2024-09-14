"use server";

import { actionClient, createErrorResult } from "@/lib/safe-action";

export const listUserProject = actionClient.action(
  async ({ ctx: { apiClient } }) => {
    try {
      const res = await apiClient.listProjects();
      return { success: res };
    } catch (error) {
      return createErrorResult("listProjects", error);
    }
  }
);
