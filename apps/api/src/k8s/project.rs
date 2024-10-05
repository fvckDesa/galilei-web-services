use k8s_openapi::api::networking::v1::NetworkPolicy;
use kube::{
  api::{Patch, PatchParams},
  Api, Client, Result,
};
use serde_json::json;

use crate::schemas::Project;

use super::K8S_CONFIG;

pub async fn reconcile_project(project: &Project, client: Client) -> Result<()> {
  let name = format!("project-{}", project.project_id);
  let params = PatchParams::apply(&K8S_CONFIG.manager).force();

  let api: Api<NetworkPolicy> = Api::namespaced(client, &K8S_CONFIG.namespace);

  let net = api.get_opt(&name).await?;

  if net.is_none() {
    let net = generate_network_policy(&name, project);
    api.patch(&name, &params, &Patch::Apply(net)).await?;
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
          ],
          "ports": [
            {
              "port": &K8S_CONFIG.port_name
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
          ],
          "ports": [
            {
              "port": &K8S_CONFIG.port_name
            }
          ]
        }
      ]
    }
  }))
  .expect("Invalid Network Policy")
}
