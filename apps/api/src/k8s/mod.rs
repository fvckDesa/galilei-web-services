use std::sync::LazyLock;

use confique::Config;
use kube::Client;

use crate::schemas::AppService;

pub use app::app_status;

mod app;

pub async fn release(apps: Vec<AppService>) -> kube::Result<()> {
  let client = Client::try_default().await?;

  for app in apps {
    app::reconcile_app(app, client.clone()).await?;
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
