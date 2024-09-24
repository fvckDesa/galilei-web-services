use derive_more::derive::From;
use k8s_openapi::api::apps::v1::DeploymentStatus;
use regex::Regex;
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
  #[serde(skip_serializing_if = "Option::is_none", default)]
  pub public_domain: Option<String>,
  pub deleted: bool,
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

#[derive(Debug, Serialize, Deserialize, Validate, ToSchema)]
pub struct DomainName {
  #[schema(
    min_length = 1,
    max_length = 62,
    pattern = "(^[a-zA-Z0-9]$)|(^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]$)"
  )]
  #[validate(regex(path = Regex::new(r"(^[a-zA-Z0-9]$)|(^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]$)").unwrap()))]
  pub subdomain: Option<String>,
}

partial_schema! {
  PartialAppServiceSchema,
  #[derive(Debug, Serialize, Deserialize, Validate, ToSchema)]
  #[serde(rename_all = "camelCase")]
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
    #[validate(nested)]
    pub public_domain: DomainName,
  }
}

#[derive(Debug, Default, Serialize, ToSchema)]
pub enum AppReleaseState {
  #[default]
  Unknown,
  Failed,
  Progressing,
  Released,
}

#[derive(Debug, Default, Serialize, ToSchema, IntoResponses)]
#[response(status = 200, content_type = "text/event-stream")]
#[serde(rename_all = "camelCase")]
pub struct AppStatus {
  available: bool,
  state: AppReleaseState,
}

impl From<DeploymentStatus> for AppStatus {
  fn from(value: DeploymentStatus) -> Self {
    let mut status = AppStatus {
      available: false,
      state: AppReleaseState::Unknown,
    };
    if let Some(conditions) = value.conditions {
      if let Some(available) = conditions.iter().find(|&con| con.type_ == "Available") {
        status.available = available.status == "True";
      }
      if let Some(progressing) = conditions.iter().find(|&con| con.type_ == "Progressing") {
        status.state = match progressing.reason.as_deref() {
          Some("NewReplicaSetCreated") | Some("FoundNewReplicaSet") | Some("ReplicaSetUpdated") => {
            AppReleaseState::Progressing
          }
          Some("NewReplicaSetAvailable") => AppReleaseState::Released,
          Some("ProgressDeadlineExceeded") => AppReleaseState::Failed,
          _ => AppReleaseState::Unknown,
        }
      }
    }

    status
  }
}
