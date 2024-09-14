import { listUserProject } from "./action";

export default async function ProjectsPage() {
  const projects = await listUserProject();
  return <div>{JSON.stringify(projects)}</div>;
}
