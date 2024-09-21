use k8s_openapi::api::{
  apps::v1::{Deployment, DeploymentSpec},
  core::v1::{Container, ContainerPort, Service},
};
use kube::{
  api::{Patch, PatchParams},
  Api, Client, Result,
};
use serde_json::json;

use crate::schemas::AppService;

use super::K8S_CONFIG;

pub async fn reconcile_app(app: AppService, client: Client) -> Result<()> {
  let name = format!("app-{}", app.app_id);
  let params = PatchParams::apply(&K8S_CONFIG.manager).force();

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
  let api: Api<Deployment> = Api::namespaced(client, &K8S_CONFIG.namespace);

  let current_deploy = api.get_opt(name).await?;

  if current_deploy.is_some() && app.deleted {
    api.delete(name, &Default::default()).await?;
  }

  if current_deploy.is_none()
    || get_replicas(current_deploy.as_ref()).is_some_and(|replicas| replicas != app.replicas)
    || get_container_by_name(current_deploy.as_ref(), name).is_some_and(|container| {
      container
        .image
        .as_ref()
        .is_some_and(|image| image != &app.image)
    })
    || get_port_by_name(current_deploy.as_ref(), name, "app")
      .is_some_and(|port| port.container_port != app.port)
  {
    let deploy = generate_deploy(name, app);

    api.patch(name, params, &Patch::Apply(deploy)).await?;
  }

  Ok(())
}

fn get_port_by_name<'a>(
  deploy: Option<&'a Deployment>,
  container_name: &str,
  name: &str,
) -> Option<&'a ContainerPort> {
  if let Some(container) = get_container_by_name(deploy, container_name) {
    if let Some(ports) = &container.ports {
      if let Some(port) = ports.iter().find(|&port| {
        port
          .name
          .as_ref()
          .is_some_and(|port_name| port_name == name)
      }) {
        return Some(port);
      }
    }
  }

  None
}

fn get_container_by_name<'a>(deploy: Option<&'a Deployment>, name: &str) -> Option<&'a Container> {
  if let Some(spec) = get_deploy_spec(deploy) {
    if let Some(pod) = &spec.template.spec {
      if let Some(container) = pod
        .containers
        .iter()
        .find(|&container| container.name == name)
      {
        return Some(container);
      }
    }
  }
  None
}

fn get_replicas(deploy: Option<&Deployment>) -> Option<i32> {
  if let Some(spec) = get_deploy_spec(deploy) {
    if let Some(replicas) = spec.replicas {
      return Some(replicas);
    }
  }

  None
}

fn get_deploy_spec(deploy: Option<&Deployment>) -> Option<&DeploymentSpec> {
  if let Some(deploy) = deploy {
    if let Some(spec) = &deploy.spec {
      return Some(spec);
    }
  }
  None
}

fn generate_deploy(name: &str, app: &AppService) -> Deployment {
  serde_json::from_value(json!({
    "apiVersion": "apps/v1",
    "kind": "Deployment",
    "metadata": {
      "name": name,
      "namespace": K8S_CONFIG.namespace
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
                  "name": K8S_CONFIG.port_name,
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
  let api: Api<Service> = Api::namespaced(client, &K8S_CONFIG.namespace);

  let current_service = api.get_opt(name).await?;

  if current_service.is_some() && app.deleted {
    api.delete(name, &Default::default()).await?;
  }

  if current_service.is_none() {
    let service = generate_svc(name);

    api.patch(name, params, &Patch::Apply(service)).await?;
  }

  Ok(())
}

fn generate_svc(name: &str) -> Service {
  serde_json::from_value(json!({
    "apiVersion": "v1",
    "kind": "Service",
    "metadata": {
      "name": name,
      "namespace": K8S_CONFIG.namespace
    },
    "spec": {
      "selector": {
        "app": name
      },
      "ports": [
        {
          "protocol": "TCP",
          "port": K8S_CONFIG.service_port,
          "targetPort": K8S_CONFIG.port_name
        }
      ]
    }
  }))
  .expect("Invalid app service")
}
