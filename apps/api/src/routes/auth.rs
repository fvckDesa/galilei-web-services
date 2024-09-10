use actix_web::{post, web::ServiceConfig, HttpRequest, HttpResponse};
use actix_web_validator::Json;
use chrono::{naive::serde::ts_seconds_option, Duration, NaiveDateTime, Utc};
use derive_more::derive::{Constructor, Debug};
use hex::FromHex;
use serde::{Deserialize, Serialize};
use std::ops::DerefMut;
use utoipa::{IntoResponses, ToSchema};
use uuid::Uuid;
use validator::Validate;

use crate::{
  auth::{AuthSecurity, Password, Token, API_KEY},
  database::{entities::User, Pool},
  error::{
    AlreadyExistsErrorMessage, BadRequestErrorMessage, InternalServerErrorMessage,
    UnauthorizedErrorMessage,
  },
  impl_json_response, utils, ApiError, ApiResult,
};

#[derive(Debug, Serialize, Constructor, IntoResponses)]
#[response(status = StatusCode::OK)]
pub struct AuthResponse {
  user: User,
  #[debug(skip)]
  token: Token,
  #[serde(with = "ts_seconds_option")]
  expires: Option<NaiveDateTime>,
}
impl_json_response!(AuthResponse);

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct AuthData {
  #[validate(length(min = 1))]
  #[serde(deserialize_with = "utils::trim_string")]
  username: String,
  #[debug(skip)]
  #[validate(nested)]
  #[serde(flatten)]
  password: Password,
  remember: bool,
}

#[utoipa::path(
  responses(
    AuthResponse,
    BadRequestErrorMessage,
    AlreadyExistsErrorMessage,
    InternalServerErrorMessage
  ),
  security(
    () // api key not required
  )
)]
#[post("/auth/register")]
pub async fn register(Json(auth_ata): Json<AuthData>, pool: Pool) -> ApiResult<AuthResponse> {
  let AuthData {
    username,
    password,
    remember,
  } = auth_ata;

  let mut tx = pool.begin().await?;

  let user = sqlx::query_as!(
    User,
    "INSERT INTO users(username, password) VALUES ($1, $2) RETURNING *",
    username,
    password.hash()?
  )
  .fetch_one(tx.deref_mut())
  .await?;

  let (token, expires) = create_session(tx.deref_mut(), &user.user_id, remember).await?;

  tx.commit().await?;

  Ok(AuthResponse::new(user, token, expires))
}

#[utoipa::path(
  responses(
    AuthResponse,
    BadRequestErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  ),
  security(
    () // api key not required
  )
)]
#[post("/auth/login")]
pub async fn login(Json(auth_ata): Json<AuthData>, pool: Pool) -> ApiResult<AuthResponse> {
  let AuthData {
    username,
    password,
    remember,
  } = auth_ata;

  let mut tx = pool.begin().await?;

  let user = sqlx::query_as!(User, "SELECT * FROM users WHERE username = $1", username)
    .fetch_one(tx.deref_mut())
    .await?;

  password.verify(&user.password)?;

  let (token, expires) = create_session(tx.deref_mut(), &user.user_id, remember).await?;

  tx.commit().await?;

  Ok(AuthResponse::new(user, token, expires))
}

#[utoipa::path(
  responses((status = NO_CONTENT), BadRequestErrorMessage, UnauthorizedErrorMessage, InternalServerErrorMessage)
)]
#[post("/auth/logout")]
pub async fn logout(req: HttpRequest, pool: Pool) -> ApiResult<HttpResponse> {
  let api_key = req.headers().get(API_KEY);

  if let Some(token) = api_key {
    let token = Token::from_hex(token)?;

    let query = sqlx::query!("DELETE FROM sessions WHERE token = $1", token.hash()?)
      .execute(pool.as_ref())
      .await?;

    if query.rows_affected() > 0 {
      return Ok(HttpResponse::NoContent().finish());
    }
  }
  Err(ApiError::Unauthorized)
}

pub fn config(cfg: &mut ServiceConfig) {
  cfg.service(register).service(login).service(logout);
}

async fn create_session(
  conn: &mut sqlx::PgConnection,
  user_id: &Uuid,
  remember: bool,
) -> ApiResult<(Token, Option<NaiveDateTime>)> {
  let token = Token::generate()?;
  let expires = if remember {
    None
  } else {
    Some((Utc::now() + Duration::hours(1)).naive_utc())
  };

  sqlx::query!(
    "INSERT INTO sessions(token, expires, user_id) VALUES ($1, $2, $3)",
    token.hash()?,
    expires,
    user_id
  )
  .execute(conn)
  .await?;

  Ok((token, expires))
}
