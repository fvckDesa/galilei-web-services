use actix_web::{
  delete, get, patch, post,
  web::{Path, ServiceConfig},
};
use actix_web_validator::Json;

use crate::{
  database::Pool,
  error::{
    AlreadyExistsErrorMessage, BadRequestErrorMessage, InternalServerErrorMessage,
    NotFoundErrorMessage, UnauthorizedErrorMessage,
  },
  schemas::{
    AppPath, AppService, AppServiceSchema, AppServicesList, PartialAppServiceSchema, ProjectPath,
  },
  ApiResult,
};

const CONTEXT_PATH: &str = "/projects/{project_id}";

#[utoipa::path(
  context_path = CONTEXT_PATH,
  params(ProjectPath),
  responses(
    AppServicesList,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[get("/apps")]
pub async fn list_apps(path: Path<ProjectPath>, pool: Pool) -> ApiResult<AppServicesList> {
  let ProjectPath { project_id } = *path;
  let apps = sqlx::query_as!(
    AppService,
    "SELECT * FROM app_services WHERE project_id = $1",
    project_id
  )
  .fetch_all(pool.as_ref())
  .await?;

  Ok(AppServicesList::from(apps))
}

#[utoipa::path(
  context_path = CONTEXT_PATH,
  params(ProjectPath),
  responses(
    AppService,
    BadRequestErrorMessage,
    NotFoundErrorMessage,
    AlreadyExistsErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[post("/apps")]
pub async fn create_app(
  path: Path<ProjectPath>,
  Json(app): Json<AppServiceSchema>,
  pool: Pool,
) -> ApiResult<AppService> {
  let ProjectPath { project_id } = *path;
  let AppServiceSchema {
    name,
    replicas,
    image,
    port,
  } = app;

  let app = sqlx::query_as!(
    AppService,
    "INSERT INTO app_services(app_name, replicas, image, port, project_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    name,
    replicas,
    image,
    port,
    project_id
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(app)
}

#[utoipa::path(
  context_path = CONTEXT_PATH,
  params(AppPath),
  responses(
    AppService,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[get("/apps/{app_id}")]
pub async fn get_app(path: Path<AppPath>, pool: Pool) -> ApiResult<AppService> {
  let AppPath { project_id, app_id } = *path;

  let app = sqlx::query_as!(
    AppService,
    "SELECT * FROM app_services WHERE project_id = $1 AND app_id = $2",
    project_id,
    app_id
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(app)
}

#[utoipa::path(
  context_path = CONTEXT_PATH,
  params(AppPath),
  responses(
    AppService,
    BadRequestErrorMessage,
    NotFoundErrorMessage,
    AlreadyExistsErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[patch("/apps/{app_id}")]
pub async fn update_app(
  path: Path<AppPath>,
  Json(app): Json<PartialAppServiceSchema>,
  pool: Pool,
) -> ApiResult<AppService> {
  let AppPath { project_id, app_id } = *path;
  let PartialAppServiceSchema {
    name,
    replicas,
    image,
    port,
  } = app;

  let app = sqlx::query_as!(
    AppService,
    r#"
    UPDATE app_services
    SET app_name = COALESCE($1, app_name),
      replicas = COALESCE($2, replicas),
      image = COALESCE($3, image),
      port = COALESCE($4, port)
    WHERE project_id = $5 AND app_id = $6
    RETURNING *
    "#,
    name,
    replicas,
    image,
    port,
    project_id,
    app_id
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(app)
}

#[utoipa::path(
  context_path = CONTEXT_PATH,
  params(AppPath),
  responses(
    AppService,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[delete("/apps/{app_id}")]
pub async fn delete_app(path: Path<AppPath>, pool: Pool) -> ApiResult<AppService> {
  let AppPath { project_id, app_id } = *path;

  let app = sqlx::query_as!(
    AppService,
    "DELETE FROM app_services WHERE project_id = $1 AND app_id = $2 RETURNING *",
    project_id,
    app_id,
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(app)
}

pub fn config(cfg: &mut ServiceConfig) {
  cfg
    .service(list_apps)
    .service(create_app)
    .service(get_app)
    .service(update_app)
    .service(delete_app);
}
