use chrono::{naive::serde::ts_milliseconds_option, NaiveDateTime};
use derive_more::derive::{Constructor, Debug};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;
use validator::Validate;

use crate::{
  auth::{Password, Token},
  impl_json_response, utils,
};

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct User {
  #[serde(rename = "id")]
  pub user_id: Uuid,
  pub username: String,
  #[serde(skip)]
  pub password: String,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct Session {
  #[serde(skip)]
  #[allow(dead_code)]
  pub session_id: Uuid,
  pub token: String,
  pub expires: Option<NaiveDateTime>,
  #[serde(skip)]
  #[allow(dead_code)]
  pub user_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize, Constructor, ToSchema)]
pub struct AuthResponse {
  pub user: User,
  #[debug(skip)]
  pub token: Token,
  #[serde(with = "ts_milliseconds_option")]
  #[schema(value_type = i64)]
  pub expires: Option<NaiveDateTime>,
}
impl_json_response!(AuthResponse);

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct AuthData {
  #[schema(min_length = 1)]
  #[validate(length(min = 1))]
  #[serde(deserialize_with = "utils::trim_string")]
  pub username: String,
  #[debug(skip)]
  #[schema(format = Password)]
  #[validate(nested)]
  #[serde(flatten)]
  pub password: Password,
  pub remember: bool,
}
