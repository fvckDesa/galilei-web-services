use k8s_openapi::api::{apps::v1::Deployment, core::v1::Secret};
use kube::{
  api::{Patch, PatchParams},
  Api, Client, Result,
};
use serde_json::json;
use uuid::Uuid;

use crate::models::var::Variable;

use super::ResourceBind;

pub struct VariableRequestResolver {
  secret: Api<Secret>,
  deploy: Api<Deployment>,
  galaxy_id: Uuid,
}

impl VariableRequestResolver {
  pub async fn try_default(galaxy_id: Uuid) -> Result<Self> {
    let client = Client::try_default().await?;
    let galaxy_ns = format!("galaxy-{}", galaxy_id);

    Ok(Self {
      secret: Api::namespaced(client.clone(), &galaxy_ns),
      deploy: Api::namespaced(client, &galaxy_ns),
      galaxy_id,
    })
  }
}

impl Variable {
  async fn patch(&self, api: VariableRequestResolver) -> Result<()> {
    let secret_name = format!("star-{}-vars", self.star_id);
    let deploy_name = format!("star-{}", self.star_id);
    let pp = PatchParams::apply("gws-api");

    let secret = json!({
      "apiVersion": "v1",
      "kind": "Secret",
      "metadata": {
        "name": &secret_name,
        "namespace": format!("galaxy-{}", api.galaxy_id),
      },
      "stringData": {
        &self.name: self.value
      }
    });

    let secret: Secret = serde_json::from_value(secret).expect("Invalid secret");

    let _ = api
      .secret
      .patch(&secret_name, &pp, &Patch::Apply(secret))
      .await?;

    let _ = api.deploy.restart(&deploy_name).await?;

    Ok(())
  }
}

impl ResourceBind for Variable {
  type RequestResolver = VariableRequestResolver;

  async fn create(&self, api: Self::RequestResolver) -> Result<()> {
    self.patch(api).await
  }

  async fn update(&self, api: Self::RequestResolver) -> Result<()> {
    self.patch(api).await
  }

  async fn delete(&self, api: Self::RequestResolver) -> Result<()> {
    let secret_name = format!("star-{}-vars", self.star_id);
    let deploy_name = format!("star-{}", self.star_id);

    let mut secret = api.secret.get(&secret_name).await?;

    if let Some(ref mut vars) = secret.data {
      let var = vars.remove(&self.name);

      let _ = api
        .secret
        .replace(&secret_name, &Default::default(), &secret)
        .await?;

      if var.is_some() {
        let _ = api.deploy.restart(&deploy_name).await?;
      }
    }

    Ok(())
  }
}
