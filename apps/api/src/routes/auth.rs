use actix_web::{post, web::ServiceConfig, HttpResponse};
use actix_web_validator::Json;
use serde::{Deserialize, Serialize};
use utoipa::{IntoResponses, ToSchema};
use validator::Validate;

use crate::{
  database::entities::{Session, User},
  error::{
    AlreadyExistsErrorMessage, BadRequestErrorMessage, InternalServerErrorMessage,
    UnauthorizedErrorMessage,
  },
  impl_json_response, ApiResult,
};

#[derive(Debug, Default, Serialize, IntoResponses)]
#[response(status = StatusCode::OK)]
pub struct AuthResponse {
  user: User,
  session: Session,
}
impl_json_response!(AuthResponse);

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct Credentials {
  #[validate(length(min = 1))]
  username: String,
  #[validate(length(min = 1))]
  password: String,
}

#[utoipa::path(responses(
  AuthResponse,
  BadRequestErrorMessage,
  AlreadyExistsErrorMessage,
  InternalServerErrorMessage
))]
#[post("/auth/register")]
pub async fn register(Json(_credentials): Json<Credentials>) -> ApiResult<AuthResponse> {
  Ok(AuthResponse::default())
}

#[utoipa::path(responses(
  AuthResponse,
  BadRequestErrorMessage,
  UnauthorizedErrorMessage,
  InternalServerErrorMessage
))]
#[post("/auth/login")]
pub async fn login(Json(_credentials): Json<Credentials>) -> ApiResult<AuthResponse> {
  Ok(AuthResponse::default())
}

#[utoipa::path(
  responses((status = NO_CONTENT), BadRequestErrorMessage, UnauthorizedErrorMessage, InternalServerErrorMessage)
)]
#[post("/auth/logout")]
pub async fn logout() -> ApiResult<HttpResponse> {
  Ok(HttpResponse::NoContent().finish())
}

pub fn config(cfg: &mut ServiceConfig) {
  cfg.service(register).service(login).service(logout);
}
