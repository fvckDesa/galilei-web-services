import { Page } from "@/lib/types";
import { getApp } from "./actions";
import { unwrap } from "@/lib/safe-action";
import { AppForm } from "./form";
import {
  Resource,
  ResourceContent,
  ResourceHeader,
  ResourceName,
} from "@/components/resource";

export default async function AppPage({
  params: { projectId, appId },
}: Page<{ projectId: string; appId: string }>) {
  const {
    id: _id,
    projectId: _projectId,
    ...app
  } = await getApp({ projectId, appId }).then(unwrap);

  return (
    <Resource type="App" resourceSelected={app}>
      <ResourceHeader>
        <ResourceName>{app.name}</ResourceName>
      </ResourceHeader>
      <ResourceContent>
        <AppForm projectId={projectId} appId={appId} app={app} />
      </ResourceContent>
    </Resource>
  );
}
