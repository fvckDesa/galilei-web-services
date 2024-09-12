use derive_more::derive::From;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, IntoResponses, ToSchema};
use uuid::Uuid;
use validator::Validate;

use crate::{impl_json_response, partial_schema};

#[derive(Debug, Default, Serialize, ToSchema, IntoResponses)]
#[response(status = OK)]
#[serde(rename_all = "camelCase")]
pub struct AppService {
  #[serde(rename = "id")]
  pub app_id: Uuid,
  #[serde(rename = "name")]
  pub app_name: String,
  pub replicas: i32,
  pub image: String,
  pub port: i32,
  pub project_id: Uuid,
}
impl_json_response!(AppService);

#[derive(Debug, From, Serialize, IntoResponses)]
#[response(status = OK)]
pub struct AppServicesList(#[to_schema] Vec<AppService>);
impl_json_response!(AppServicesList);

#[derive(Debug, Deserialize, IntoParams)]
pub struct AppPath {
  pub project_id: Uuid,
  pub app_id: Uuid,
}

partial_schema! {
  PartialAppServiceSchema,
  #[derive(Debug, Serialize, Deserialize, Validate, ToSchema)]
  pub struct AppServiceSchema {
    #[schema(min_length = 1)]
    #[validate(length(min = 1))]
    pub name: String,
    #[schema(minimum = 0)]
    #[validate(range(min = 0))]
    pub replicas: i32,
    #[schema(min_length = 1)]
    #[validate(length(min = 1))]
    pub image: String,
    #[schema(minimum = 1, maximum = 65535)]
    #[validate(range(min = 1, max = 65535))]
    pub port: i32,
  }
}
