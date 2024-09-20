use kube::{Client, Result};

use crate::schemas::AppService;

mod app;

pub async fn release(apps: Vec<AppService>) -> Result<()> {
  let client = Client::try_default().await?;

  for app in apps {
    app::reconcile_app(app, client.clone()).await?;
  }

  Ok(())
}
