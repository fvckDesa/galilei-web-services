#!/usr/bin/env -S pnpm tsx
import { spinner, minimist, path } from "zx";
import { $$, checkDependencies, Logger } from "./utils";

const CLUSTER_NAME = "gws" as const;
const log = new Logger({ tag: "setup" });
const argv = minimist(process.argv.slice(2), {
  string: ["config", "kube"],
  alias: {
    c: "config",
    k: "kube",
  },
  default: {
    config: "./k3d-default.yaml",
    kube: "./apps/api/k8s",
  },
});

try {
  await checkDependencies([
    "k3d",
    "docker",
    "docker-compose",
    "kubectl",
    "helm",
  ]);
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
} else {
  await spinner(
    `Starting ${CLUSTER_NAME} cluster...`,
    () => $$`k3d cluster start ${CLUSTER_NAME}`
  );
}

interface HelmRepo {
  name: string;
}

const repos: HelmRepo[] = await $$.dbg`helm repo list -o json`.json();
if (!repos.find((repo) => repo.name === "jetstack")) {
  log.info(`Repo jetstack for cert-manager not found`);
  await spinner(
    `Adding cert-manager repo...`,
    () => $$`helm repo add jetstack https://charts.jetstack.io --force-update`
  );
}

interface HelmChart {
  name: string;
}

const charts: HelmChart[] = await $$.dbg`helm list -A -o json`.json();
const CERT_MANAGER_CHART_NAME = "cert-manager";
if (!charts.find((chart) => chart.name === CERT_MANAGER_CHART_NAME)) {
  log.info(`Chart ${CERT_MANAGER_CHART_NAME} not found`);
  await spinner(
    `Installing cert-manager...`,
    () =>
      $$`helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set crds.enabled=true`
  );
}
log.info(`Apply resources to cluster ${CLUSTER_NAME}`);
await spinner(
  `Apply namespace...`,
  () =>
    $$`kubectl apply -f ${path.join(process.cwd(), argv.kube, "namespace.yaml")}`
);
await spinner(
  `Apply http to https middleware...`,
  () =>
    $$`kubectl apply -f ${path.join(process.cwd(), argv.kube, "http-to-https.yaml")}`
);
await spinner(
  `Apply cluster self-signed issuer...`,
  () =>
    $$`kubectl apply -f ${path.join(process.cwd(), argv.kube, "cluster-self-signed-issuer.yaml")}`
);
await spinner(
  `Apply apps certificate issuer...`,
  () =>
    $$`kubectl apply -f ${path.join(process.cwd(), argv.kube, "apps-cert.yaml")}`
);

log.success(`Cluster ${CLUSTER_NAME} running`);

log.info("Start development database");
await spinner(
  "Starting development database...",
  () => $$`docker compose up -d`
);
log.success("Database running");
