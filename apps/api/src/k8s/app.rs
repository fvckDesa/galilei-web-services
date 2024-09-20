use k8s_openapi::api::{apps::v1::Deployment, core::v1::Service};
use kube::{
  api::{Patch, PatchParams},
  Api, Client, Result,
};
use serde_json::json;

use crate::schemas::AppService;

pub async fn reconcile_app(app: AppService, client: Client) -> Result<()> {
  let name = format!("app-{}", app.app_id);
  let params = PatchParams::apply("gws").force();

  reconcile_deploy(&name, &app, client.clone(), &params).await?;

  reconcile_svc(&name, &app, client.clone(), &params).await?;

  Ok(())
}

async fn reconcile_deploy(
  name: &str,
  app: &AppService,
  client: Client,
  params: &PatchParams,
) -> Result<()> {
  let api: Api<Deployment> = Api::namespaced(client, "gws");

  let current_deploy = api.get_opt(name).await?;

  if current_deploy.is_none() {
    let deploy = generate_deploy(name, app);

    api.patch(name, params, &Patch::Apply(deploy)).await?;
  }

  Ok(())
}

fn generate_deploy(name: &str, app: &AppService) -> Deployment {
  serde_json::from_value(json!({
    "apiVersion": "apps/v1",
    "kind": "Deployment",
    "metadata": {
      "name": name,
      "namespace": "gws"
    },
    "spec": {
      "replicas": app.replicas,
      "selector": {
        "matchLabels": {
          "app": name
        }
      },
      "template": {
        "metadata": {
          "labels": {
            "app": name
          }
        },
        "spec": {
          "containers": [
            {
              "name": name,
              "image": app.image,
              "ports": [
                {
                  "containerPort": app.port
                }
              ]
            }
          ]
        }
      }
    }
  }))
  .expect("Invalid app deployment")
}

async fn reconcile_svc(
  name: &str,
  app: &AppService,
  client: Client,
  params: &PatchParams,
) -> Result<()> {
  let api: Api<Service> = Api::namespaced(client, "gws");

  let current_service = api.get_opt(name).await?;

  if current_service.is_none() {
    let service = generate_svc(name, app);

    api.patch(name, params, &Patch::Apply(service)).await?;
  }

  Ok(())
}

fn generate_svc(name: &str, app: &AppService) -> Service {
  serde_json::from_value(json!({
    "apiVersion": "v1",
    "kind": "Service",
    "metadata": {
      "name": name,
      "namespace": "gws"
    },
    "spec": {
      "selector": {
        "app": name
      },
      "ports": [
        {
          "protocol": "TCP",
          "port": app.port,
        }
      ]
    }
  }))
  .expect("Invalid app service")
}
