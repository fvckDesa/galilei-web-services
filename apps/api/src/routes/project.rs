use actix_web::{
  delete, get, patch, post,
  web::{Path, ServiceConfig},
};
use actix_web_validator::Json;
use uuid::Uuid;

use crate::{
  auth::UserId,
  database::Pool,
  error::{
    AlreadyExistsErrorMessage, BadRequestErrorMessage, InternalServerErrorMessage,
    NotFoundErrorMessage, UnauthorizedErrorMessage,
  },
  schemas::{PartialProjectSchema, Project, ProjectSchema, ProjectsList},
  ApiResult,
};

#[utoipa::path(responses(ProjectsList, UnauthorizedErrorMessage, InternalServerErrorMessage))]
#[get("/projects")]
pub async fn list_projects(pool: Pool, user_id: UserId) -> ApiResult<ProjectsList> {
  let projects = sqlx::query_as!(
    Project,
    "SELECT * FROM projects WHERE user_id = $1",
    *user_id
  )
  .fetch_all(&**pool)
  .await?;

  Ok(ProjectsList::from(projects))
}

#[utoipa::path(responses(
  Project,
  BadRequestErrorMessage,
  AlreadyExistsErrorMessage,
  UnauthorizedErrorMessage,
  InternalServerErrorMessage
))]
#[post("/projects")]
pub async fn create_project(
  Json(project): Json<ProjectSchema>,
  pool: Pool,
  user_id: UserId,
) -> ApiResult<Project> {
  let new_project = sqlx::query_as!(
    Project,
    "INSERT INTO projects(project_name, user_id) VALUES ($1, $2) RETURNING *",
    project.name,
    *user_id
  )
  .fetch_one(&**pool)
  .await?;

  Ok(new_project)
}

#[utoipa::path(responses(
  Project,
  NotFoundErrorMessage,
  UnauthorizedErrorMessage,
  InternalServerErrorMessage
))]
#[get("/projects/{project_id}")]
pub async fn get_project(project_id: Path<Uuid>, pool: Pool) -> ApiResult<Project> {
  let project = sqlx::query_as!(
    Project,
    "SELECT * FROM projects WHERE project_id = $1",
    *project_id
  )
  .fetch_one(&**pool)
  .await?;

  Ok(project)
}

#[utoipa::path(responses(
  Project,
  BadRequestErrorMessage,
  NotFoundErrorMessage,
  AlreadyExistsErrorMessage,
  UnauthorizedErrorMessage,
  InternalServerErrorMessage
))]
#[patch("/projects/{project_id}")]
pub async fn update_project(
  project_id: Path<Uuid>,
  Json(project): Json<PartialProjectSchema>,
  pool: Pool,
) -> ApiResult<Project> {
  let project = sqlx::query_as!(
    Project,
    "UPDATE projects SET project_name = COALESCE($1, project_name) WHERE project_id = $2 RETURNING *",
    project.name,
    *project_id
  )
  .fetch_one(&**pool)
  .await?;

  Ok(project)
}

#[utoipa::path(responses(
  Project,
  NotFoundErrorMessage,
  UnauthorizedErrorMessage,
  InternalServerErrorMessage
))]
#[delete("/projects/{project_id}")]
pub async fn delete_project(project_id: Path<Uuid>, pool: Pool) -> ApiResult<Project> {
  let project = sqlx::query_as!(
    Project,
    "DELETE FROM projects WHERE project_id = $1 RETURNING *",
    *project_id
  )
  .fetch_one(&**pool)
  .await?;

  Ok(project)
}

pub fn config(cfg: &mut ServiceConfig) {
  cfg
    .service(list_projects)
    .service(create_project)
    .service(get_project)
    .service(update_project)
    .service(delete_project);
}
