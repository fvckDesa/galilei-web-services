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
struct Project(#[to_schema] entities::Project);
impl_json_response!(Project);

#[derive(Debug, Default, Serialize, IntoResponses)]
#[response(status = OK)]
struct ProjectsList(#[to_schema] Vec<entities::Project>);
impl_json_response!(ProjectsList);

#[utoipa::path(responses(ProjectsList, UnauthorizedErrorMessage, InternalServerErrorMessage))]
#[get("/projects")]
pub async fn list_projects() -> ApiResult<ProjectsList> {
  Ok(ProjectsList::default())
}

#[derive(Debug, Serialize, Deserialize, Validate, ToSchema)]
pub struct ProjectSpec {
  #[validate(length(min = 1))]
  name: String,
}

#[utoipa::path(responses(
  Project,
  BadRequestErrorMessage,
  AlreadyExistsErrorMessage,
  UnauthorizedErrorMessage,
  InternalServerErrorMessage
))]
#[post("/projects")]
pub async fn create_project(Json(_spec): Json<ProjectSpec>) -> ApiResult<Project> {
  Ok(Project::default())
}

#[utoipa::path(responses(
  Project,
  NotFoundErrorMessage,
  UnauthorizedErrorMessage,
  InternalServerErrorMessage
))]
#[get("/projects/{project_id}")]
pub async fn get_project(_project_id: Path<Uuid>) -> ApiResult<Project> {
  Ok(Project::default())
}

#[utoipa::path(responses(
  Project,
  BadRequestErrorMessage,
  NotFoundErrorMessage,
  AlreadyExistsErrorMessage,
  UnauthorizedErrorMessage,
  InternalServerErrorMessage
))]
#[put("/projects/{project_id}")]
pub async fn update_project(
  _project_id: Path<Uuid>,
  Json(_project): Json<ProjectSpec>,
) -> ApiResult<Project> {
  Ok(Project::default())
}

#[utoipa::path(responses(
  Project,
  NotFoundErrorMessage,
  UnauthorizedErrorMessage,
  InternalServerErrorMessage
))]
#[delete("/projects/{project_id}")]
pub async fn delete_project(_project_id: Path<Uuid>) -> ApiResult<Project> {
  Ok(Project::default())
}

pub fn config(cfg: &mut ServiceConfig) {
  cfg
    .service(list_projects)
    .service(create_project)
    .service(get_project)
    .service(update_project)
    .service(delete_project);
}
