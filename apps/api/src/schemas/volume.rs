use derive_more::derive::From;
use regex::Regex;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, IntoResponses, ToSchema};
use uuid::Uuid;
use validator::Validate;

use crate::{impl_json_response, partial_schema};

#[derive(Debug, Default, Serialize, ToSchema, IntoResponses)]
#[response(status = OK)]
#[serde(rename_all = "camelCase")]
pub struct Volume {
  #[serde(rename = "id")]
  pub volume_id: Uuid,
  #[serde(rename = "name")]
  pub volume_name: String,
  pub capacity: i32,
  pub path: String,
  pub deleted: bool,
  #[serde(skip_serializing_if = "Option::is_none", default)]
  pub app_id: Option<Uuid>,
  pub project_id: Uuid,
}
impl_json_response!(Volume);

#[derive(Debug, From, Serialize, IntoResponses)]
#[response(status = OK)]
pub struct VolumesList(#[to_schema] Vec<Volume>);
impl_json_response!(VolumesList);

#[derive(Debug, Deserialize, IntoParams)]
pub struct VolumePath {
  pub project_id: Uuid,
  pub volume_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct VolumeAppId {
  pub id: Option<Uuid>,
}

partial_schema! {
  PartialVolumeSchema,
  #[derive(Debug, Serialize, Deserialize, Validate, ToSchema)]
  #[serde(rename_all = "camelCase")]
  pub struct VolumeSchema {
    #[schema(min_length = 1)]
    #[validate(length(min = 1))]
    pub name: String,
    #[schema(minimum = 1, maximum = 5000)] // min = 1MB, max = 5000MB = 5GB
    #[validate(range(min = 1, max = 5000))]
    pub capacity: i32,
    #[schema(
      min_length = 1,
      pattern = r"^/([a-zA-Z0-9.\-_/])*"
    )]
    #[validate(regex(path = Regex::new(r"^/([a-zA-Z0-9.\-_/])*").unwrap()))]
    pub path: String,
    pub app: VolumeAppId,
  }
}
