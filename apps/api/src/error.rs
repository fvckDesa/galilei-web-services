use actix_web::{
  http::{header, StatusCode},
  HttpResponse, ResponseError,
};
use derive_more::{Display, Error};
use serde::Serialize;
use utoipa::{IntoResponses, ToSchema};
use validator::ValidationErrors;

use crate::auth;

pub type ApiResult<T, E = ApiError> = Result<T, E>;

#[derive(Debug, Display, Error, Clone, Serialize, ToSchema)]
#[serde(tag = "kind")]
pub enum ApiError {
  #[display("{message}")]
  BadRequest {
    #[serde(skip)]
    message: String,
  },
  #[display("{errors}")]
  Validation {
    #[serde(skip)]
    errors: ValidationErrors,
  },
  #[display("Resource already exists")]
  AlreadyExists,
  #[display("Resource not found")]
  NotFound,
  #[display("User not authorized")]
  Unauthorized,
  #[display("Internal server error occurred")]
  InternalError,
}

impl ResponseError for ApiError {
  fn error_response(&self) -> HttpResponse {
    HttpResponse::build(self.status_code())
      .append_header(header::ContentType::json())
      .json(ErrorMessage {
        kind: self.clone(),
        message: self.to_string(),
      })
  }

  fn status_code(&self) -> StatusCode {
    match self {
      ApiError::BadRequest { .. } => StatusCode::BAD_REQUEST,
      ApiError::Validation { .. } => StatusCode::BAD_REQUEST,
      ApiError::NotFound { .. } => StatusCode::NOT_FOUND,
      ApiError::AlreadyExists { .. } => StatusCode::CONFLICT,
      ApiError::Unauthorized => StatusCode::UNAUTHORIZED,
      ApiError::InternalError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }
}

impl From<actix_web_validator::Error> for ApiError {
  fn from(err: actix_web_validator::Error) -> Self {
    log::error!("Validation error: {}", err.to_string());

    match err {
      actix_web_validator::Error::Validate(errors) => ApiError::Validation { errors },
      err => ApiError::BadRequest {
        message: err.to_string(),
      },
    }
  }
}

impl From<sqlx::Error> for ApiError {
  fn from(err: sqlx::Error) -> Self {
    log::error!("Database error: {}", err.to_string());

    match err {
      sqlx::Error::RowNotFound => ApiError::NotFound,
      sqlx::Error::Database(err) => match err.kind() {
        sqlx::error::ErrorKind::UniqueViolation => ApiError::AlreadyExists,
        sqlx::error::ErrorKind::ForeignKeyViolation => ApiError::NotFound,
        _ => ApiError::InternalError,
      },
      _ => ApiError::InternalError,
    }
  }
}

impl From<auth::AuthError> for ApiError {
  fn from(err: auth::AuthError) -> Self {
    log::error!("Auth error: {}", err.to_string());

    match err {
      auth::AuthError::Invalid => ApiError::Unauthorized,
      auth::AuthError::Other(_) => ApiError::InternalError,
    }
  }
}

#[derive(Debug, Serialize, ToSchema)]
pub struct ErrorMessage {
  #[serde(flatten)]
  kind: ApiError,
  message: String,
}

#[derive(IntoResponses)]
#[response(status = BAD_REQUEST)]
pub struct BadRequestErrorMessage(#[allow(unused)] ErrorMessage);

#[derive(IntoResponses)]
#[response(status = NOT_FOUND)]
pub struct NotFoundErrorMessage(#[allow(unused)] ErrorMessage);

#[derive(IntoResponses)]
#[response(status = CONFLICT)]
pub struct AlreadyExistsErrorMessage(#[allow(unused)] ErrorMessage);

#[derive(IntoResponses)]
#[response(status = UNAUTHORIZED)]
pub struct UnauthorizedErrorMessage(#[allow(unused)] ErrorMessage);

#[derive(IntoResponses)]
#[response(status = UNAUTHORIZED)]
pub struct InternalServerErrorMessage(#[allow(unused)] ErrorMessage);
