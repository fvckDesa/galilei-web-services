use derive_more::derive::From;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, IntoResponses, ToSchema};
use uuid::Uuid;
use validator::Validate;

use crate::{impl_json_response, partial_schema};

#[derive(Debug, Serialize, ToSchema, IntoResponses)]
#[response(status = OK)]
#[serde(rename_all = "camelCase")]
pub struct EnvVar {
  #[serde(rename = "id")]
  pub env_id: Uuid,
  #[serde(rename = "name")]
  pub env_name: String,
  #[serde(rename = "value")]
  pub env_value: String,
  pub app_id: Uuid,
}
impl_json_response!(EnvVar);

#[derive(Debug, From, Serialize, IntoResponses)]
#[response(status = OK)]
pub struct EnvList(#[to_schema] Vec<EnvVar>);
impl_json_response!(EnvList);

#[derive(Debug, Deserialize, IntoParams)]
pub struct EnvPath {
  pub project_id: Uuid,
  pub app_id: Uuid,
  pub env_id: Uuid,
}

partial_schema! {
  PartialEnvSchema,
  #[derive(Debug, Serialize, Deserialize, Validate, ToSchema)]
  #[serde(rename_all = "camelCase")]
  pub struct EnvSchema {
    #[schema(min_length = 1)]
    #[validate(length(min = 1))]
    pub name: String,
    #[schema(min_length = 1)]
    #[validate(length(min = 1))]
    pub value: String,
  }
}
