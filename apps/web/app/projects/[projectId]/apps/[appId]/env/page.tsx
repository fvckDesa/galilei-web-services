import { Page } from "@/lib/types";
import { getAppEnvs } from "@/server-actions/env";
import { unwrap } from "@/lib/utils";
import { EnvVar } from "./env-var";

export default async function EnvPage({
  params: { projectId, appId },
}: Page<{
  projectId: string;
  appId: string;
}>) {
  const envs = await getAppEnvs({ projectId, appId }).then(unwrap);

  return (
    <ul className="flex w-full flex-1 flex-col gap-2">
      {envs
        .toSorted((a, b) => a.name.localeCompare(b.name))
        .map(({ id, name, value }) => (
          <EnvVar
            key={id}
            projectId={projectId}
            appId={appId}
            envId={id}
            name={name}
            value={value}
          />
        ))}
    </ul>
  );
}
