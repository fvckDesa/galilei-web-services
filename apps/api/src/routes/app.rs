use actix_web::{
  delete, get, post, put,
  web::{Path, ServiceConfig},
};
use actix_web_validator::Json;
use serde::{Deserialize, Serialize};
use utoipa::{IntoResponses, ToSchema};
use uuid::Uuid;
use validator::Validate;

use crate::{
  database::entities,
  error::{
    AlreadyExistsErrorMessage, BadRequestErrorMessage, InternalServerErrorMessage,
    NotFoundErrorMessage, UnauthorizedErrorMessage,
  },
  impl_json_response, ApiResult,
};

#[derive(Debug, Default, Serialize, IntoResponses)]
#[response(status = OK)]
struct AppService(#[to_schema] entities::AppService);
impl_json_response!(AppService);

#[derive(Debug, Default, Serialize, IntoResponses)]
#[response(status = OK)]
struct AppServicesList(#[to_schema] Vec<entities::AppService>);
impl_json_response!(AppServicesList);

#[utoipa::path(responses(
  AppServicesList,
  NotFoundErrorMessage,
  UnauthorizedErrorMessage,
  InternalServerErrorMessage
))]
#[get("/projects/{project_id}/apps")]
pub async fn list_apps(_path: Path<Uuid>) -> ApiResult<AppServicesList> {
  Ok(AppServicesList::default())
}

#[derive(Debug, Serialize, Deserialize, Validate, ToSchema)]
pub struct AppServiceSpec {
  #[validate(length(min = 1))]
  name: String,
  #[validate(range(min = 0))]
  replicas: i32,
  #[validate(length(min = 1))]
  image: String,
  #[validate(range(min = 1, max = 65535))]
  port: i32,
}

#[utoipa::path(responses(
  AppService,
  BadRequestErrorMessage,
  NotFoundErrorMessage,
  AlreadyExistsErrorMessage,
  UnauthorizedErrorMessage,
  InternalServerErrorMessage
))]
#[post("/projects/{project_id}/apps")]
pub async fn create_app(
  _path: Path<Uuid>,
  Json(_spec): Json<AppServiceSpec>,
) -> ApiResult<AppService> {
  Ok(AppService::default())
}

#[utoipa::path(responses(
  AppService,
  NotFoundErrorMessage,
  UnauthorizedErrorMessage,
  InternalServerErrorMessage
))]
#[get("/projects/{project_id}/apps/{app_id}")]
pub async fn get_app(_path: Path<(Uuid, Uuid)>) -> ApiResult<AppService> {
  Ok(AppService::default())
}

#[utoipa::path(responses(
  AppService,
  BadRequestErrorMessage,
  NotFoundErrorMessage,
  AlreadyExistsErrorMessage,
  UnauthorizedErrorMessage,
  InternalServerErrorMessage
))]
#[put("/projects/{project_id}/apps/{app_id}")]
pub async fn update_app(
  _path: Path<(Uuid, Uuid)>,
  Json(_app): Json<AppServiceSpec>,
) -> ApiResult<AppService> {
  Ok(AppService::default())
}

#[utoipa::path(responses(
  AppService,
  NotFoundErrorMessage,
  UnauthorizedErrorMessage,
  InternalServerErrorMessage
))]
#[delete("/projects/{project_id}/apps/{app_id}")]
pub async fn delete_app(_path: Path<(Uuid, Uuid)>) -> ApiResult<AppService> {
  Ok(AppService::default())
}

pub fn config(cfg: &mut ServiceConfig) {
  cfg
    .service(list_apps)
    .service(create_app)
    .service(get_app)
    .service(update_app)
    .service(delete_app);
}
