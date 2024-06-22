use actix_web::{
  cookie::{time::OffsetDateTime, Cookie, SameSite},
  delete, get, post,
  web::{Json, ServiceConfig},
  HttpRequest, HttpResponse, Responder,
};
use chrono::{Days, NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::models::{
  session::Session,
  user::{Credentials, User},
};
use crate::{auth::Token, error::ApiError};
use crate::{
  config::CONFIG,
  error::{
    AlreadyExistsResponse, ApiResult, InternalErrorResponse, NotFoundResponse, ValidationResponse,
  },
};
use crate::{
  database::{DbResult, Transaction},
  error::UnauthorizeResponse,
};

#[derive(Serialize, Debug, utoipa::ToResponse)]
#[response(
  description = "user authorized from session token",
  content_type = "application/json",
  headers(
    ("Set-Cookie" = String, description = "The session ID is returned in a cookie named `session`. You need to include this cookie in subsequent requests.")
  )
)]
#[serde(transparent)]
pub struct AuthResponse {
  user: User,
  #[serde(skip)]
  expires: Option<OffsetDateTime>,
  #[serde(skip)]
  token: Token,
}

impl AuthResponse {
  async fn session(mut tx: Transaction, remember: bool, user: User) -> DbResult<Self> {
    let token = Token::generate()?;

    let now = Utc::now();

    let expires = if remember {
      Some(
        NaiveDateTime::new(now.date_naive(), now.time())
          .checked_add_days(Days::new(1))
          .expect("Out of range"),
      )
    } else {
      None
    };

    let session = Session::create(&mut tx, &token, expires, &user.id).await?;

    let expires = session.expires.map(|timestamp| {
      let utc = timestamp.and_utc();
      // this is just a date-time conversion between two different types from two different libraries
      // so this function should never cause errors
      OffsetDateTime::from_unix_timestamp(utc.timestamp()).expect("invalid timestamp")
    });

    Ok(Self {
      user,
      expires,
      token,
    })
  }
}

impl Responder for AuthResponse {
  type Body = actix_web::body::BoxBody;

  fn respond_to(self, _req: &actix_web::HttpRequest) -> HttpResponse<Self::Body> {
    let AuthResponse {
      user,
      expires,
      token,
    } = self;

    let config = CONFIG.get().expect("Config not initialized");

    let session_cookie = Cookie::build("session", token.value())
      .expires(expires)
      .http_only(true)
      .domain(&config.cookie_domain)
      .path("/")
      .same_site(SameSite::Lax)
      .finish();

    HttpResponse::Ok().cookie(session_cookie).json(user)
  }
}

#[derive(Debug, Deserialize, Validate, utoipa::ToSchema)]
pub struct AuthData {
  #[serde(flatten)]
  #[validate(nested)]
  credentials: Credentials,
  remember: bool,
}

#[utoipa::path(
  request_body(
    content = AuthData,
    description = "registration data",
    content_type = "application/json"
  ),
  responses(
    (status = OK, response = AuthResponse),
    (status = CONFLICT, response = AlreadyExistsResponse),
    (status = BAD_REQUEST, response = ValidationResponse),
    (status = INTERNAL_SERVER_ERROR, response = InternalErrorResponse)
  ),
  security(
    () // security is not required
  )
)]
#[post("/auth/register")]
pub async fn register(
  mut tx: Transaction,
  Json(auth_data): Json<AuthData>,
) -> ApiResult<AuthResponse> {
  auth_data.validate()?;

  let AuthData {
    credentials,
    remember,
  } = auth_data;

  let new_user = User::create(&mut tx, credentials).await?;

  Ok(AuthResponse::session(tx, remember, new_user).await?)
}

#[utoipa::path(
  request_body(
    content = AuthData,
    description = "login data",
    content_type = "application/json"
  ),
  responses(
    (status = OK, response = AuthResponse),
    (status = CONFLICT, response = AlreadyExistsResponse),
    (status = BAD_REQUEST, response = ValidationResponse),
    (status = INTERNAL_SERVER_ERROR, response = InternalErrorResponse)
  ),
  security(
    () // security is not required
  )
)]
#[post("/auth/login")]
pub async fn login(
  mut tx: Transaction,
  Json(auth_data): Json<AuthData>,
) -> ApiResult<AuthResponse> {
  // validate only the received data not the auth_data in database
  auth_data.validate()?;

  let AuthData {
    credentials,
    remember,
  } = auth_data;

  let user = User::verify_credentials(&mut tx, credentials).await?;

  Ok(AuthResponse::session(tx, remember, user).await?)
}

#[utoipa::path(
  responses(
    (status = NO_CONTENT),
    (status = UNAUTHORIZED, response = UnauthorizeResponse),
    (status = NOT_FOUND, response = NotFoundResponse),
    (status = INTERNAL_SERVER_ERROR, response = InternalErrorResponse)
  )
)]
#[get("/auth/verify")]
pub async fn verify(mut tx: Transaction, req: HttpRequest) -> ApiResult<HttpResponse> {
  if let Some(cookie) = req.cookie("session") {
    let _ = Session::verify_token(&mut tx, Token::new(cookie.value().to_string())).await?;
    return Ok(HttpResponse::NoContent().finish());
  }

  Err(ApiError::Unauthorize)
}

#[utoipa::path(
  responses(
    (status = NO_CONTENT),
    (status = NOT_FOUND, response = NotFoundResponse),
    (status = INTERNAL_SERVER_ERROR, response = InternalErrorResponse)
  )
)]
#[delete("/auth/logout")]
pub async fn logout(mut tx: Transaction, req: HttpRequest) -> ApiResult<HttpResponse> {
  if let Some(cookie) = req.cookie("session") {
    Session::delete(&mut tx, Token::new(cookie.value().to_string())).await?;
  }

  Ok(HttpResponse::NoContent().finish())
}

pub fn config(cfg: &mut ServiceConfig) {
  cfg
    .service(register)
    .service(login)
    .service(verify)
    .service(logout);
}
