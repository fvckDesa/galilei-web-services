use std::sync::LazyLock;

use confique::Config;
use kube::Client;

use crate::schemas::{AppService, EnvVar, Project, Volume};

pub use app::app_status;

mod app;
mod project;
mod volume;

pub async fn release(
  project: Project,
  apps: Vec<AppService>,
  envs: Vec<EnvVar>,
  volumes: Vec<Volume>,
) -> kube::Result<()> {
  let client = Client::try_default().await?;

  project::reconcile_project(&project, &apps[..], client.clone()).await?;

  for volume in &volumes {
    volume::reconcile_volume(volume, client.clone()).await?;
  }

  let apps_volumes: Vec<&Volume> = volumes
    .iter()
    .filter(|volume| volume.app_id.is_some())
    .collect();

  for app_service in apps {
    let envs = envs
      .iter()
      .filter(|env| env.app_id == app_service.app_id)
      .collect();

    let volume = apps_volumes
      .iter()
      .find(|&&volume| volume.app_id.is_some_and(|id| id == app_service.app_id))
      .copied();

    app::reconcile_app(&project, app_service, envs, volume, client.clone()).await?;
  }

  Ok(())
}

static K8S_CONFIG: LazyLock<K8sConfig> =
  LazyLock::new(|| K8sConfig::builder().env().load().unwrap());

#[derive(Config)]
struct K8sConfig {
  #[config(env = "K8S_NAMESPACE", default = "gws")]
  namespace: String,
  #[config(env = "K8S_MANAGER", default = "gws")]
  manager: String,
  #[config(env = "K8S_PORT_NAME", default = "app")]
  port_name: String,
  #[config(env = "K8S_SERVICE_PORT", default = 80)]
  service_port: u16,
  #[config(env = "HOST_DOMAIN", default = "localhost")]
  host_domain: String,
}
