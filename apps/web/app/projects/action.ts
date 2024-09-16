"use server";

import { apiClient } from "@/lib/api";
import { apiActionClient } from "@/lib/safe-action";

export const listUserProject = apiActionClient
  .metadata({ name: "listProjects" })
  .action(async () => await apiClient.listProjects());
