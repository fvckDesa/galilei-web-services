#!/usr/bin/env -S pnpm tsx
import { spinner, minimist, path, globby } from "zx";
import { $$, checkDependencies, Logger } from "./utils";

const CLUSTER_NAME = "gws" as const;
const log = new Logger({ tag: "setup" });
const argv = minimist(process.argv.slice(2), {
  string: ["config"],
  alias: {
    c: "config",
  },
  default: {
    config: "./k3d-default.yaml",
  },
});

try {
  await checkDependencies(["k3d", "docker", "docker-compose", "kubectl"]);
} catch (err) {
  if (err instanceof Error) {
    log.error(err.message);
  }
  process.exit(1);
}

interface K3dCluster {
  name: string;
}

log.info("Start development k8s cluster");

const clusters: K3dCluster[] =
  await $$.dbg`k3d cluster list --output json`.json();

if (!clusters.some((cluster) => cluster.name == CLUSTER_NAME)) {
  log.info(`Cluster ${CLUSTER_NAME} not found`);
  await spinner(
    `Creating ${CLUSTER_NAME} cluster...`,
    () =>
      $$`k3d cluster create ${CLUSTER_NAME} --config ${path.join(process.cwd(), argv.config)}`
  );
  log.info(`Apply resources to cluster ${CLUSTER_NAME}`);
  const resources = await globby("**/k8s/*.yaml", { gitignore: true });
  await Promise.all(
    resources.map((res) =>
      spinner(`Applying ${res}`, () => $$`kubectl apply -f ${res}`)
    )
  );
} else {
  await spinner(
    `Starting ${CLUSTER_NAME} cluster...`,
    () => $$`k3d cluster start ${CLUSTER_NAME}`
  );
}
log.success(`Cluster ${CLUSTER_NAME} running`);

log.info("Start development database");
await spinner(
  "Starting development database...",
  () => $$`docker compose up -d`
);
log.success("Database running");
