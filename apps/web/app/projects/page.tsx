import { listUserProject } from "./action";

export default async function ProjectsPage() {
  const res = await listUserProject();

  const { success, error } = res?.data ?? {};

  if (error) {
    throw error;
  }

  return <div>{JSON.stringify(success)}</div>;
}
