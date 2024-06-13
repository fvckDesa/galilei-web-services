use k8s_openapi::api::{
  core::v1::{Namespace, Secret},
  networking::v1::NetworkPolicy,
};
use kube::{api::Request, Api, Client, Error, Result};
use serde_json::{json, Value};

use crate::models::galaxy::Galaxy;

use super::ResourceBind;

const NAMESPACE_BASE_PATH: &'static str = "/api/v1/namespaces";

impl From<&Galaxy> for Namespace {
  fn from(value: &Galaxy) -> Self {
    let namespace = json!({
      "version": "v1",
      "metadata": {
        "name": format!("galaxy-{}", value.id),
        "labels": {
          "name": value.name,
          "galaxy_id": value.id
        }
      }
    });

    serde_json::from_value(namespace).expect("Invalid namespace format")
  }
}

impl From<&Galaxy> for Secret {
  fn from(value: &Galaxy) -> Self {
    let tls_secret_replica = json!({
      "apiVersion": "v1",
      "kind": "Secret",
      "metadata": {
        "name": "stars-tls-secret-replica",
        "namespace": format!("galaxy-{}", value.id),
        "annotations": {
          "replicator.v1.mittwald.de/replicate-from": "cert-manager/stars-src-tls"
        }
      },
      "type": "kubernetes.io/tls",
      "data": {
        "tls.key": "",
        "tls.crt": "",
      }
    });

    serde_json::from_value(tls_secret_replica).expect("Invalid tls secret replica")
  }
}

impl From<&Galaxy> for NetworkPolicy {
  fn from(galaxy: &Galaxy) -> Self {
    let ns = format!("galaxy-{}", galaxy.id);

    let net_policy = json!({
      "kind": "NetworkPolicy",
      "apiVersion": "networking.k8s.io/v1",
      "metadata": {
        "name": format!("net-policy-galaxy-{}", galaxy.id),
        "namespace": &ns,
      },
      "spec": {
        "podSelector": {},
        "ingress": [
          {
            "from": [
              {
                "namespaceSelector": {
                  "matchExpressions": [
                    {
                      "key": "kubernetes.io/metadata.name",
                      "operator": "In",
                      "values": ["kube-system", &ns]
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    });

    serde_json::from_value(net_policy).expect("Invalid Network Policy")
  }
}

impl ResourceBind for Galaxy {
  type RequestResolver = Client;

  async fn create(&self, client: Self::RequestResolver) -> Result<()> {
    let namespace = Namespace::from(self);
    let ns_buf = serde_json::to_vec(&namespace).expect("Error converting namespace to Vec<u8>");

    let req = Request::new(NAMESPACE_BASE_PATH)
      .create(&Default::default(), ns_buf)
      .map_err(|err| Error::BuildRequest(err))?;

    let _: Namespace = client.request(req).await?;

    let secrets: Api<Secret> = Api::namespaced(client.clone(), &format!("galaxy-{}", self.id));

    let _ = secrets
      .create(&Default::default(), &Secret::from(self))
      .await?;

    let net_policies: Api<NetworkPolicy> =
      Api::namespaced(client.clone(), &format!("galaxy-{}", self.id));

    let _ = net_policies
      .create(&Default::default(), &NetworkPolicy::from(self))
      .await?;

    Ok(())
  }

  async fn update(&self, client: Self::RequestResolver) -> Result<()> {
    let namespace = Namespace::from(self);
    let ns_buf = serde_json::to_vec(&namespace).expect("Error converting namespace to Vec<u8>");

    let req = Request::new(NAMESPACE_BASE_PATH)
      .replace(&format!("galaxy-{}", self.id), &Default::default(), ns_buf)
      .map_err(|err| Error::BuildRequest(err))?;

    let _: Value = client.request(req).await?;

    Ok(())
  }

  async fn delete(&self, client: Self::RequestResolver) -> Result<()> {
    let name = format!("galaxy-{}", self.id);

    let req = Request::new(NAMESPACE_BASE_PATH)
      .delete(&name, &Default::default())
      .map_err(|err| Error::BuildRequest(err))?;

    let _: Value = client.request(req).await?;

    let secrets: Api<Secret> = Api::namespaced(client.clone(), &name);

    let _ = secrets
      .delete("stars-tls-secret-replica", &Default::default())
      .await?;

    let net_policies: Api<NetworkPolicy> = Api::namespaced(client.clone(), &name);

    let _ = net_policies
      .delete(
        &format!("net-policy-galaxy-{}", self.id),
        &Default::default(),
      )
      .await?;

    Ok(())
  }
}
