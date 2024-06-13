use k8s_openapi::api::{
  apps::v1::Deployment,
  core::v1::{ConfigMap, Secret, Service},
  networking::v1::Ingress,
};
use kube::{
  api::{DeleteParams, Patch, PatchParams, PostParams},
  Api, Client, Result,
};
use serde_json::json;
use uuid::Uuid;

use crate::models::star::Star;

use super::ResourceBind;

pub struct StarRequestResolver {
  secret: Api<Secret>,
  deploy: Api<Deployment>,
  svc: Api<Service>,
  ingress: Api<Ingress>,
  coredns_custom: Api<ConfigMap>,
}

impl StarRequestResolver {
  pub async fn try_default(galaxy_id: &Uuid) -> Result<Self> {
    let client = Client::try_default().await?;
    let galaxy_ns = format!("galaxy-{}", galaxy_id);

    Ok(Self {
      secret: Api::namespaced(client.clone(), &galaxy_ns),
      deploy: Api::namespaced(client.clone(), &galaxy_ns),
      svc: Api::namespaced(client.clone(), &galaxy_ns),
      ingress: Api::namespaced(client.clone(), &galaxy_ns),
      coredns_custom: Api::namespaced(client, "kube-system"),
    })
  }
}

impl From<&Star> for Secret {
  fn from(star: &Star) -> Self {
    let secret = json!({
      "apiVersion": "v1",
      "kind": "Secret",
      "metadata": {
        "name": format!("star-{}-vars", star.id),
        "namespace": format!("galaxy-{}", star.galaxy_id),
      },
      "stringData": {}
    });

    serde_json::from_value(secret).expect("Invalid secret")
  }
}

impl From<&Star> for Deployment {
  fn from(star: &Star) -> Self {
    let deployment = json!({
      "apiVersion": "apps/v1",
      "kind": "Deployment",
      "metadata": {
        "name": format!("star-{}", star.id),
        "namespace": format!("galaxy-{}", star.galaxy_id),
        "labels": {
          "star_name": star.name,
          "star_id": star.id,
          "galaxy_id": star.galaxy_id,
        },
        "annotasions": {
          "kubernetes.io/change-cause": "gws api"
        }
      },
      "spec": {
        "replicas": 1,
        "selector": {
          "matchLabels": {
            "star_id": star.id,
          },
        },
        "template": {
          "metadata": {
            "labels": {
              "star_name": star.name,
              "star_id": star.id,
              "galaxy_id": star.galaxy_id
            },
          },
          "spec": {
            "enableServiceLinks": false,
            "containers": [
              {
                "name": format!("star-container-{}", star.id),
                "image": star.nebula.to_lowercase(),
                "env": [
                  {
                    "name": "ADDRESS",
                    "value": "0.0.0.0"
                  },
                  {
                    "name": "PORT",
                    "value": star.port.to_string()
                  }
                ],
                "envFrom": [
                  {
                    "secretRef": {
                      "name": format!("star-{}-vars", star.id)
                    }
                  }
                ],
                "ports": [
                  {
                    "containerPort": star.port
                  }
                ]
              }
            ],
          }
        },
      },
    });

    serde_json::from_value(deployment).expect("Invalid deployment")
  }
}

impl From<&Star> for Service {
  fn from(star: &Star) -> Self {
    let svc = json!({
      "apiVersion": "v1",
      "kind": "Service",
      "metadata": {
        "name": format!("star-{}", star.id),
        "namespace": format!("galaxy-{}", star.galaxy_id),
        "labels": {
          "star_name": star.name,
          "star_id": star.id,
          "galaxy_id": star.galaxy_id,
        },
      },
      "spec": {
        "selector": {
          "star_id": star.id,
        },
        "ports": [
          {
            "port": star.port,
            "targetPort": star.port,
          },
        ],
      },
    });

    serde_json::from_value(svc).expect("Invalid service")
  }
}

impl From<&Star> for ConfigMap {
  fn from(star: &Star) -> Self {
    let private_domain = star
      .private_domain
      .as_ref()
      .expect("Private domain not found when creating coredns config map");

    let custom_dns = json!({
      "apiVersion": "v1",
      "kind": "ConfigMap",
      "metadata": {
        "name": "coredns-custom",
        "namespace": "kube-system"
      },
      "data": {
        format!("star-{}.override", star.id): format!(
          r#"template IN ANY {}.gws.internal {{
              match "^{}\.gws\.internal\.$"
              answer "{{{{ .Name }}}} 60 IN CNAME star-{}.{{{{ .Meta \"kubernetes/client-namespace\" }}}}.svc.cluster.local"
            }}"#,
          private_domain,
          private_domain,
          star.id,
        )
      }
    });

    serde_json::from_value(custom_dns).expect("Invalid coredns configmap")
  }
}

impl From<&Star> for Ingress {
  fn from(star: &Star) -> Self {
    let public_domain = star
      .public_domain
      .as_ref()
      .expect("Public domain not found when creating ingress");

    let ingress = json!({
      "apiVersion": "networking.k8s.io/v1",
      "kind": "Ingress",
      "metadata": {
        "name": format!("star-{}", star.id),
        "namespace": format!("galaxy-{}", star.galaxy_id),
        "labels": {
          "star_name": star.name,
          "star_id": star.id,
          "galaxy_id": star.galaxy_id,
        },
        "annotations": {
          "traefik.ingress.kubernetes.io/router.middlewares": "default-redirect@kubernetescrd",
          "traefik.ingress.kubernetes.io/router.entrypoints": "web, websecure"
        }
      },
      "spec": {
        "tls": [
          {
            "hosts": [
              format!("{}.localhost", public_domain),
            ],
            "secretName": "stars-tls-secret-replica"
          }
        ],
        "rules": [
          {
            "host": format!("{}.localhost", public_domain),
            "http": {
              "paths": [
                {
                  "path": "/",
                  "pathType": "Prefix",
                  "backend": {
                    "service": {
                      "name": format!("star-{}", star.id),
                      "port": {
                        "number": star.port,
                      }
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    });

    serde_json::from_value(ingress).expect("Invalid Ingress")
  }
}

impl ResourceBind for Star {
  type RequestResolver = StarRequestResolver;

  async fn create(&self, api: Self::RequestResolver) -> Result<()> {
    // create env variables secret
    let _ = api
      .secret
      .create(&Default::default(), &Secret::from(self))
      .await?;

    let _ = api
      .deploy
      .create(&Default::default(), &Deployment::from(self))
      .await?;

    let _ = api
      .svc
      .create(&Default::default(), &Service::from(self))
      .await?;

    if self.public_domain.is_some() {
      let _ = api
        .ingress
        .create(&Default::default(), &Ingress::from(self))
        .await?;
    }

    if self.private_domain.is_some() {
      let _ = api
        .coredns_custom
        .patch(
          "coredns-custom",
          &PatchParams::apply("gws-api"),
          &Patch::Apply(ConfigMap::from(self)),
        )
        .await?;
    }

    Ok(())
  }

  async fn update(&self, api: Self::RequestResolver) -> Result<()> {
    let k8s_name = format!("star-{}", self.id.to_string());
    let pp = PostParams::default();

    let _ = api
      .deploy
      .replace(&k8s_name, &pp, &Deployment::from(self))
      .await?;

    let _ = api
      .svc
      .replace(&k8s_name, &pp, &Service::from(self))
      .await?;

    if api.ingress.get_opt(&k8s_name).await?.is_some() {
      if self.public_domain.is_some() {
        let _ = api
          .ingress
          .replace(&k8s_name, &pp, &Ingress::from(self))
          .await?;
      } else {
        let _ = api.ingress.delete(&k8s_name, &Default::default()).await?;
      }
    } else {
      if self.public_domain.is_some() {
        let _ = api
          .ingress
          .create(&Default::default(), &Ingress::from(self))
          .await?;
      }
    }

    let pp = PatchParams::apply("gws-api");
    let patch = Patch::Apply(if self.private_domain.is_some() {
      ConfigMap::from(self)
    } else {
      let mut coredns_custom = api.coredns_custom.get("coredns-custom").await?;

      if let Some(data) = coredns_custom.data.as_mut() {
        let _ = data.remove(&format!("star-{}.override", self.id));
      }

      coredns_custom
    });

    let _ = api
      .coredns_custom
      .patch("coredns-custom", &pp, &patch)
      .await?;

    Ok(())
  }

  async fn delete(&self, api: Self::RequestResolver) -> Result<()> {
    let k8s_name = format!("star-{}", self.id.to_string());
    let dp = DeleteParams::default();

    let _ = api
      .secret
      .delete(&format!("star-{}-vars", self.id), &dp)
      .await?;

    let _ = api.deploy.delete(&k8s_name, &dp).await?;

    let _ = api.svc.delete(&k8s_name, &dp).await?;

    if api.ingress.get_opt(&k8s_name).await?.is_some() {
      let _ = api.ingress.delete(&k8s_name, &dp).await?;
    }

    let mut coredns_custom = api.coredns_custom.get("coredns-custom").await?;

    if let Some(data) = coredns_custom.data.as_mut() {
      let _ = data.remove(&format!("star-{}.override", self.id));
    }

    let _ = api
      .coredns_custom
      .replace("coredns-custom", &Default::default(), &coredns_custom)
      .await?;

    Ok(())
  }
}
