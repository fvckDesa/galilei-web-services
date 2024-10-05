use k8s_openapi::api::core::v1::PersistentVolumeClaim;
use kube::{
  api::{Patch, PatchParams},
  Api, Client, Result,
};
use serde_json::json;

use crate::schemas::Volume;

use super::K8S_CONFIG;

pub async fn reconcile_volume(volume: &Volume, client: Client) -> Result<()> {
  let name = format!("volume-{}", volume.volume_id);
  let params = PatchParams::apply(&K8S_CONFIG.manager).force();

  let api: Api<PersistentVolumeClaim> = Api::namespaced(client, &K8S_CONFIG.namespace);

  let pvc = api.get_opt(&name).await?;

  if pvc.is_some() && volume.deleted {
    api.delete(&name, &Default::default()).await?;
    return Ok(());
  }

  if pvc.is_none() {
    let pvc = generate_pvc(&name, volume);
    api.patch(&name, &params, &Patch::Apply(pvc)).await?;
  }

  Ok(())
}

fn generate_pvc(name: &str, volume: &Volume) -> PersistentVolumeClaim {
  serde_json::from_value(json!({
    "apiVersion": "v1",
    "kind": "PersistentVolumeClaim",
    "metadata": {
      "name": name,
      "namespace": K8S_CONFIG.namespace,
    },
    "spec": {
      "accessModes": [
        "ReadWriteOnce"
      ],
      "storageClassName": "local-path",
      "resources": {
        "requests": {
          "storage": format!("{}M", volume.capacity)
        }
      }
    }
  }))
  .expect("Invalid Persistent Volume Claim")
}
