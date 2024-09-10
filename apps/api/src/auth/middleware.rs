use actix_web::{
  body::MessageBody,
  dev::{ServiceRequest, ServiceResponse},
  middleware::Next,
  web::Data,
  FromRequest, HttpMessage,
};
use chrono::Utc;
use derive_more::derive::Deref;
use hex::FromHex;
use std::{
  future::{ready, Ready},
  sync::Arc,
};
use uuid::Uuid;

use crate::ApiError;

use super::{AuthSecurity, Token, API_KEY};

#[derive(Clone, Debug, Deref)]
#[deref(forward)]
pub struct UserId(Arc<Uuid>);

impl FromRequest for UserId {
  type Error = actix_web::Error;
  type Future = Ready<Result<Self, Self::Error>>;

  fn from_request(req: &actix_web::HttpRequest, _: &mut actix_web::dev::Payload) -> Self::Future {
    let extensions = req.extensions();
    let user_id = extensions.get::<UserId>().expect("UserId not found");

    ready(Ok(user_id.clone()))
  }
}

pub async fn auth_middleware(
  req: ServiceRequest,
  next: Next<impl MessageBody>,
) -> Result<ServiceResponse<impl MessageBody>, actix_web::Error> {
  let pool = req
    .app_data::<Data<sqlx::PgPool>>()
    .expect("Pool not found");

  if let Some(api_key) = req.headers().get(API_KEY) {
    let token = Token::from_hex(api_key.as_bytes()).map_err(|_| ApiError::Unauthorized)?;

    let row = sqlx::query!(
      "SELECT user_id, expires FROM sessions WHERE token = $1",
      token
        .hash()
        .inspect(|x| println!("{x}"))
        .map_err(ApiError::from)?
    )
    .fetch_optional(pool.as_ref())
    .await
    .map_err(ApiError::from)?;

    println!("{:#?}", row);

    if let Some(row) = row {
      if row.expires.is_none()
        || row
          .expires
          .is_some_and(|expires| expires.and_utc() > Utc::now())
      {
        req.extensions_mut().insert(UserId(Arc::new(row.user_id)));

        return next.call(req).await;
      }
    }
  }

  Err(ApiError::Unauthorized)?
}
