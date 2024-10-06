use k8s_openapi::api::{core::v1::ConfigMap, networking::v1::NetworkPolicy};
use kube::{
  api::{Patch, PatchParams},
  Api, Client, Result,
};
use serde_json::json;

use crate::schemas::{AppService, Project};

use super::K8S_CONFIG;

pub async fn reconcile_project(
  project: &Project,
  apps: &[AppService],
  client: Client,
) -> Result<()> {
  let name = format!("project-{}", project.project_id);
  let params = PatchParams::apply(&K8S_CONFIG.manager).force();

  reconcile_network_policy(&name, project, &params, client.clone()).await?;

  reconcile_project_private_domains(&name, apps, &params, client.clone()).await?;

  Ok(())
}

async fn reconcile_network_policy(
  name: &str,
  project: &Project,
  params: &PatchParams,
  client: Client,
) -> Result<()> {
  let api: Api<NetworkPolicy> = Api::namespaced(client, &K8S_CONFIG.namespace);

  let net = api.get_opt(name).await?;

  if net.is_none() {
    let net = generate_network_policy(name, project);
    api.patch(name, params, &Patch::Apply(net)).await?;
  }

  Ok(())
}

fn generate_network_policy(name: &str, project: &Project) -> NetworkPolicy {
  serde_json::from_value(json!({
    "apiVersion": "networking.k8s.io/v1",
    "kind": "NetworkPolicy",
    "metadata": {
      "name": name,
      "namespace": &K8S_CONFIG.namespace
    },
    "spec": {
      "podSelector": {
        "matchLabels": {
          "project": project.project_id
        }
      },
      "policyTypes": [
        "Ingress",
        "Egress"
      ],
      "ingress": [
        {
          "from": [
            {
              "namespaceSelector": {
                "matchExpressions": [
                  {
                    "key": "kubernetes.io/metadata.name",
                    "operator": "In",
                    "values": ["kube-system", &K8S_CONFIG.namespace]
                  }
                ]
              }
            },
            {
              "podSelector": {
                "matchLabels": {
                  "project": project.project_id
                }
              }
            }
          ]
        }
      ],
      "egress": [
        {
          "to": [
            {
              "namespaceSelector": {
                "matchExpressions": [
                  {
                    "key": "kubernetes.io/metadata.name",
                    "operator": "In",
                    "values": ["kube-system", &K8S_CONFIG.namespace]
                  }
                ]
              }
            },
            {
              "podSelector": {
                "matchLabels": {
                  "project": project.project_id
                }
              }
            }
          ]
        }
      ]
    }
  }))
  .expect("Invalid Network Policy")
}

async fn reconcile_project_private_domains(
  project_name: &str,
  apps: &[AppService],
  params: &PatchParams,
  client: Client,
) -> Result<()> {
  let api: Api<ConfigMap> = Api::namespaced(client, "kube-system");
  let coredns_custom_name = "coredns-custom";

  let mut coredns_custom = api.get(coredns_custom_name).await?;

  let project_override: Vec<String> = apps
    .iter()
    .filter(|app| !app.deleted && app.private_domain.is_some())
    .map(
      |AppService {
         app_id,
         private_domain,
         ..
       }| {
        let domain = private_domain.as_deref().unwrap();
        format!(
          r#"template IN ANY {domain}.{project_name}.projects.internal {{
          match "^{domain}\.{project_name}\.projects\.internal\.$"
          answer "{{{{ .Name }}}} 60 IN CNAME app-{app_id}.gws.svc.cluster.local"
        }}"#
        )
      },
    )
    .collect();

  coredns_custom
    .data
    .as_mut()
    .expect("Coredns custom not initialized")
    .insert(
      format!("{project_name}.override"),
      project_override.join("\n"),
    );

  coredns_custom.metadata.managed_fields = None;

  api
    .patch(coredns_custom_name, params, &Patch::Apply(coredns_custom))
    .await?;

  Ok(())
}
