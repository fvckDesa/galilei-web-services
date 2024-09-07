use actix_web::{
  http::{header, StatusCode},
  HttpResponse, ResponseError,
};
use derive_more::{Display, Error};
use serde::Serialize;
use utoipa::{IntoResponses, ToSchema};
use validator::ValidationErrors;

pub type ApiResult<T, E = ApiError> = Result<T, E>;

#[derive(Debug, Display, Error)]
pub enum ApiError {
  #[display("{message}")]
  BadRequest { message: String },
  #[display("{errors}")]
  Validation { errors: ValidationErrors },
  #[display("Resource {resource} with {field} {value} already exists")]
  AlreadyExists {
    resource: String,
    field: String,
    value: String,
  },
  #[display("Resource {resource} with {field} {value} not found")]
  NotFound {
    resource: String,
    field: String,
    value: String,
  },
  #[display("User not authorized")]
  Unauthorized,
  #[display("Internal server error occurred")]
  InternalError,
}

impl ResponseError for ApiError {
  fn error_response(&self) -> HttpResponse {
    let (status_code, err_type) = match self {
      ApiError::BadRequest { .. } => (StatusCode::BAD_REQUEST, "BadRequest"),
      ApiError::Validation { .. } => (StatusCode::BAD_REQUEST, "Validation"),
      ApiError::NotFound { .. } => (StatusCode::NOT_FOUND, "NotFound"),
      ApiError::AlreadyExists { .. } => (StatusCode::CONFLICT, "AlreadyExists"),
      ApiError::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized"),
      ApiError::InternalError => (StatusCode::INTERNAL_SERVER_ERROR, "InternalError"),
    };

    HttpResponse::build(status_code)
      .append_header(header::ContentType::json())
      .json(ErrorMessage {
        r#type: err_type.to_string(),
        message: self.to_string(),
      })
  }
}

impl From<actix_web_validator::Error> for ApiError {
  fn from(value: actix_web_validator::Error) -> Self {
    match value {
      actix_web_validator::Error::Validate(errors) => ApiError::Validation { errors },
      err => ApiError::BadRequest {
        message: err.to_string(),
      },
    }
  }
}

#[derive(Debug, Serialize, ToSchema)]
pub struct ErrorMessage {
  r#type: String,
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
