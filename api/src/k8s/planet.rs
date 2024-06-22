use std::collections::BTreeMap;

use k8s_openapi::{
  api::{
    apps::v1::Deployment,
    core::v1::{PersistentVolumeClaim, PersistentVolumeClaimSpec, VolumeResourceRequirements},
  },
  apimachinery::pkg::api::resource::Quantity,
};
use kube::{
  api::{Patch, PatchParams},
  Api, Client, Result,
};
use serde_json::json;
use uuid::Uuid;

use crate::config::CONFIG;
use crate::models::planet::Planet;

use super::ResourceBind;

pub struct PlanetRequestResolver {
  pvc: Api<PersistentVolumeClaim>,
  deploy: Api<Deployment>,
}

impl PlanetRequestResolver {
  pub async fn try_default(galaxy_id: &Uuid) -> Result<Self> {
    let client = Client::try_default().await?;
    let galaxy_ns = format!("galaxy-{}", galaxy_id);

    Ok(Self {
      pvc: Api::namespaced(client.clone(), &galaxy_ns),
      deploy: Api::namespaced(client, &galaxy_ns),
    })
  }
}

impl From<&Planet> for PersistentVolumeClaim {
  fn from(planet: &Planet) -> Self {
    //! provisioner rancher.io/local-path not allow volume expansion
    //! fix generate different pvc based on provisioner

    let is_dynamic_storage_active = CONFIG
      .get()
      .map(|config| config.dynamic_storage_active)
      .unwrap_or(false);

    let storage = if is_dynamic_storage_active {
      planet.capacity
    } else {
      500 // hardcoded 500 MB storage for local-path
    };

    let pvc = json!({
      "apiVersion": "v1",
      "kind": "PersistentVolumeClaim",
      "metadata": {
        "name": format!("planet-{}", planet.id),
        "namespace": format!("galaxy-{}", planet.galaxy_id),
        "labels": {
          "planet_id": planet.id,
          "galaxy_id": planet.galaxy_id
        }
      },
      "spec": {
        "accessModes": [
          "ReadWriteOnce"
        ],
        "storageClassName": "local-path",
        "resources": {
          "requests": {
            "storage": format!("{}M", storage)
          }
        }
      }
    });

    serde_json::from_value(pvc).expect("Invalid Persistent Volume Claim format")
  }
}

impl From<&Planet> for Patch<PersistentVolumeClaim> {
  fn from(planet: &Planet) -> Self {
    let pvc = json!({
      "apiVersion": "v1",
      "kind": "PersistentVolumeClaim",
      "metadata": {
        "name": format!("planet-{}", planet.id),
        "namespace": format!("galaxy-{}", planet.galaxy_id),
        "labels": {
          "planet_id": planet.id,
          "galaxy_id": planet.galaxy_id
        }
      }
    });

    let mut pvc: PersistentVolumeClaim =
      serde_json::from_value(pvc).expect("Invalid Persistent Volume Claim format");

    let is_dynamic_storage_active = CONFIG
      .get()
      .map(|config| config.dynamic_storage_active)
      .unwrap_or(false);

    if is_dynamic_storage_active {
      pvc.spec = Some(PersistentVolumeClaimSpec {
        resources: Some(VolumeResourceRequirements {
          requests: Some(BTreeMap::from([(
            String::from("storage"),
            Quantity(format!("{}M", planet.capacity)),
          )])),
          ..Default::default()
        }),
        ..Default::default()
      })
    }

    Patch::Apply(pvc)
  }
}

impl From<&Planet> for Patch<Deployment> {
  fn from(planet: &Planet) -> Self {
    let star_id = planet
      .star_id
      .expect("Star id not found when patch star deployment");

    let star_patch = json!({
      "apiVersion": "apps/v1",
      "kind": "Deployment",
      "metadata": {
        "name": format!("star-{}", star_id),
        "namespace": format!("galaxy-{}", planet.galaxy_id),
      },
      "spec": {
        "selector": {
          "matchLabels": {
            "star_id": star_id,
          },
        },
        "template": {
          "spec": {
            "containers": [
              {
                "name": format!("star-container-{}", star_id),
                "volumeMounts": [
                  {
                    "name": format!("planet-volume-{}", planet.id),
                    "mountPath": planet.path
                  }
                ]
              }
            ],
            "volumes": [
              {
                "name": format!("planet-volume-{}", planet.id),
                "persistentVolumeClaim": {
                  "claimName": format!("planet-{}", planet.id)
                }
              }
            ]
          }
        }
      }
    });

    let star_patch = serde_json::from_value(star_patch).expect("Invalid star patch");

    Patch::Apply(star_patch)
  }
}

impl ResourceBind for Planet {
  type RequestResolver = PlanetRequestResolver;

  async fn create(&self, api: Self::RequestResolver) -> Result<()> {
    api
      .pvc
      .create(&Default::default(), &PersistentVolumeClaim::from(self))
      .await?;

    if let Some(star_id) = self.star_id {
      let pp = PatchParams::apply("gws-api");
      api
        .deploy
        .patch(
          &format!("star-{}", star_id),
          &pp,
          &Patch::<Deployment>::from(self),
        )
        .await?;
    }

    Ok(())
  }

  async fn update(&self, api: Self::RequestResolver) -> Result<()> {
    let pp = PatchParams::apply("gws-api");

    api
      .pvc
      .patch(
        &format!("planet-{}", self.id),
        &pp,
        &Patch::Apply(PersistentVolumeClaim::from(self)),
      )
      .await?;

    if let Some(star_id) = self.star_id {
      api
        .deploy
        .patch(
          &format!("star-{}", star_id),
          &pp,
          &Patch::<Deployment>::from(self),
        )
        .await?;
    }

    Ok(())
  }

  async fn delete(&self, api: Self::RequestResolver) -> Result<()> {
    api
      .pvc
      .delete(&format!("planet-{}", self.id), &Default::default())
      .await?;

    if let Some(star_id) = self.star_id {
      let star_patch = json!({
        "apiVersion": "apps/v1",
        "kind": "Deployment",
        "metadata": {
          "name": format!("star-{}", star_id),
          "namespace": format!("galaxy-{}", self.galaxy_id),
        },
        "spec": {
          "selector": {
            "matchLabels": {
              "star_id": star_id,
            },
          },
          "template": {
            "spec": {
              "containers": [
                {
                  "name": format!("star-container-{}", star_id),
                  "volumeMounts": []
                }
              ],
              "volumes": []
            }
          }
        }
      });

      api
        .deploy
        .patch(
          &format!("star-{}", star_id),
          &PatchParams::apply("gws-api"),
          &Patch::Apply(star_patch),
        )
        .await?;
    }

    Ok(())
  }
}
