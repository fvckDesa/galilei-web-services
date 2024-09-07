use chrono::NaiveDateTime;
use serde::Serialize;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Default, Serialize, ToSchema)]
pub struct User {
  #[serde(rename = "id")]
  pub user_id: Uuid,
  pub username: String,
  #[serde(skip)]
  pub password: String,
}

#[derive(Debug, Default, Serialize, ToSchema)]
pub struct Session {
  #[serde(skip)]
  pub session_id: Uuid,
  pub token: String,
  pub expires: NaiveDateTime,
  #[serde(skip)]
  pub user_id: Uuid,
}

#[derive(Debug, Default, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Project {
  #[serde(rename = "id")]
  pub project_id: Uuid,
  #[serde(rename = "name")]
  pub project_name: String,
  pub user_id: Uuid,
}

#[derive(Debug, Default, Serialize, ToSchema)]
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
