use actix_web::{
  body::MessageBody,
  dev::{ServiceRequest, ServiceResponse},
  middleware::Next,
  HttpMessage,
};
use chrono::Utc;
use hex::FromHex;

use crate::ApiError;
use crate::{
  auth::{AuthSecurity, Token, API_KEY},
  database::Pool,
};

use super::UserId;

pub async fn session_middleware(
  req: ServiceRequest,
  next: Next<impl MessageBody>,
) -> Result<ServiceResponse<impl MessageBody>, actix_web::Error> {
  let pool = req.app_data::<Pool>().expect("Pool not found");

  if let Some(api_key) = req.headers().get(API_KEY) {
    let token = Token::from_hex(api_key.as_bytes()).map_err(|_| ApiError::Unauthorized)?;

    let row = sqlx::query!(
      "SELECT user_id, expires FROM sessions WHERE token = $1",
      token.hash().map_err(ApiError::from)?
    )
    .fetch_optional(pool.as_ref())
    .await
    .map_err(ApiError::from)?;

    if let Some(row) = row {
      if row.expires.is_none()
        || row
          .expires
          .is_some_and(|expires| expires.and_utc() > Utc::now())
      {
        req.extensions_mut().insert(UserId::from(row.user_id));

        return next.call(req).await;
      }
    }
  }

  Err(ApiError::Unauthorized)?
}
