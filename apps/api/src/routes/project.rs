use actix_web::{
  delete, get, patch, post,
  web::{Path, ServiceConfig},
  HttpResponse,
};
use actix_web_validator::Json;
use uuid::Uuid;

use crate::{
  database::Pool,
  error::{
    AlreadyExistsErrorMessage, BadRequestErrorMessage, InternalServerErrorMessage,
    NotFoundErrorMessage, UnauthorizedErrorMessage,
  },
  k8s,
  middleware::UserId,
  schemas::{
    AppService, EnvVar, PartialProjectSchema, Project, ProjectPath, ProjectSchema, ProjectsList,
    Volume,
  },
  ApiResult,
};

const CONTEXT_PATH_WITHOUT_ID: &str = "/projects";

#[utoipa::path(
  context_path = CONTEXT_PATH_WITHOUT_ID,
  responses(ProjectsList, UnauthorizedErrorMessage, InternalServerErrorMessage)
)]
#[get("/")]
pub async fn list_projects(pool: Pool, user_id: UserId) -> ApiResult<ProjectsList> {
  let projects = sqlx::query_as!(
    Project,
    "SELECT * FROM projects WHERE user_id = $1",
    *user_id
  )
  .fetch_all(pool.as_ref())
  .await?;

  Ok(ProjectsList::from(projects))
}

#[utoipa::path(
  context_path = CONTEXT_PATH_WITHOUT_ID,
  responses(
  Project,
  BadRequestErrorMessage,
  AlreadyExistsErrorMessage,
  UnauthorizedErrorMessage,
  InternalServerErrorMessage
))]
#[post("/")]
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
  .fetch_one(pool.as_ref())
  .await?;

  Ok(new_project)
}

pub fn config_without_id(cfg: &mut ServiceConfig) {
  cfg.service(list_projects).service(create_project);
}

const CONTEXT_PATH_WITH_ID: &str = "/projects/{project_id}";

#[utoipa::path(
  context_path = CONTEXT_PATH_WITH_ID,
  params(ProjectPath),
  responses(
    Project,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[get("/")]
pub async fn get_project(
  path: Path<ProjectPath>,
  pool: Pool,
  user_id: UserId,
) -> ApiResult<Project> {
  let ProjectPath { project_id } = *path;

  let project = sqlx::query_as!(
    Project,
    "SELECT * FROM projects WHERE user_id = $1 AND project_id = $2",
    *user_id,
    project_id
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(project)
}

#[utoipa::path(
  context_path = CONTEXT_PATH_WITH_ID,
  params(ProjectPath),
  responses(
    Project,
    BadRequestErrorMessage,
    NotFoundErrorMessage,
    AlreadyExistsErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[patch("/")]
pub async fn update_project(
  path: Path<ProjectPath>,
  Json(project): Json<PartialProjectSchema>,
  pool: Pool,
  user_id: UserId,
) -> ApiResult<Project> {
  let ProjectPath { project_id } = *path;

  let project = sqlx::query_as!(
    Project,
    "UPDATE projects SET project_name = COALESCE($1, project_name) WHERE user_id = $2 AND project_id = $3 RETURNING *",
    project.name,
    *user_id,
    project_id
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(project)
}

#[utoipa::path(
  context_path = CONTEXT_PATH_WITH_ID,
  params(ProjectPath),
  responses(
    Project,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[delete("/")]
pub async fn delete_project(
  path: Path<ProjectPath>,
  pool: Pool,
  user_id: UserId,
) -> ApiResult<Project> {
  let ProjectPath { project_id } = *path;

  let project = sqlx::query_as!(
    Project,
    "DELETE FROM projects WHERE user_id = $1 AND project_id = $2 RETURNING *",
    *user_id,
    project_id
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(project)
}

#[utoipa::path(
  context_path = CONTEXT_PATH_WITH_ID,
  params(ProjectPath),
  responses(
    (status = NO_CONTENT),
    BadRequestErrorMessage,
    NotFoundErrorMessage,
    AlreadyExistsErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[post("/")]
pub async fn release_project(path: Path<ProjectPath>, pool: Pool) -> ApiResult<HttpResponse> {
  let ProjectPath { project_id } = *path;

  let mut tx = pool.begin().await?;

  let project = sqlx::query_as!(
    Project,
    "SELECT * FROM projects WHERE project_id = $1",
    project_id
  )
  .fetch_one(tx.as_mut())
  .await?;

  let apps = sqlx::query_as!(
    AppService,
    "SELECT * FROM app_services WHERE project_id = $1",
    project_id
  )
  .fetch_all(tx.as_mut())
  .await?;

  sqlx::query!(
    "DELETE FROM app_services WHERE project_id = $1 AND deleted = true",
    project_id,
  )
  .execute(tx.as_mut())
  .await?;

  let apps_id: Vec<Uuid> = apps.iter().map(|app| app.app_id).collect();

  let envs = sqlx::query_as!(
    EnvVar,
    "SELECT * FROM envs WHERE app_id = ANY($1)",
    &apps_id
  )
  .fetch_all(tx.as_mut())
  .await?;

  sqlx::query!(
    "DELETE FROM envs USING app_services WHERE envs.app_id = app_services.app_id AND app_services.deleted = true"
  )
  .execute(tx.as_mut())
  .await?;

  let volumes = sqlx::query_as!(
    Volume,
    "SELECT * FROM volumes WHERE project_id = $1",
    path.project_id
  )
  .fetch_all(tx.as_mut())
  .await?;

  sqlx::query!(
    "DELETE FROM volumes WHERE project_id = $1 AND deleted = true",
    path.project_id
  )
  .execute(tx.as_mut())
  .await?;

  if let Err(err) = k8s::release(project, apps, envs, volumes).await {
    tx.rollback().await?;
    return Err(err.into());
  } else {
    tx.commit().await?;
  }

  Ok(HttpResponse::NoContent().finish())
}

pub fn config_with_id(cfg: &mut ServiceConfig) {
  cfg
    .service(get_project)
    .service(update_project)
    .service(delete_project)
    .service(release_project);
}
