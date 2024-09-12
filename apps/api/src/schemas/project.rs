use derive_more::derive::From;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, IntoResponses, ToSchema};
use uuid::Uuid;
use validator::Validate;

use crate::{impl_json_response, partial_schema};

#[derive(Debug, Serialize, ToSchema, IntoResponses)]
#[response(status = OK)]
#[serde(rename_all = "camelCase")]
pub struct Project {
  #[serde(rename = "id")]
  pub project_id: Uuid,
  #[serde(rename = "name")]
  pub project_name: String,
  pub user_id: Uuid,
}
impl_json_response!(Project);

#[derive(Debug, From, Serialize, IntoResponses)]
#[response(status = OK)]
pub struct ProjectsList(#[to_schema] Vec<Project>);
impl_json_response!(ProjectsList);

#[derive(Debug, Deserialize, IntoParams)]
pub struct ProjectPath {
  pub project_id: Uuid,
}

partial_schema! {
  PartialProjectSchema,
  #[derive(Debug, Deserialize, Validate, ToSchema)]
  pub struct ProjectSchema {
    #[schema(min_length = 1)]
    #[validate(length(min = 1))]
    pub name: String,
  }
}
