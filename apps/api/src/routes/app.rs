use actix_web::{
  delete, get, patch, post,
  web::{Path, ServiceConfig},
  Responder,
};
use actix_web_lab::sse;
use actix_web_validator::Json;
use futures::TryStreamExt;

use crate::{
  database::Pool,
  error::{
    AlreadyExistsErrorMessage, BadRequestErrorMessage, InternalServerErrorMessage,
    NotFoundErrorMessage, UnauthorizedErrorMessage,
  },
  k8s,
  schemas::{
    AppPath, AppService, AppServiceSchema, AppServicesList, AppStatus, PartialAppServiceSchema,
    ProjectPath,
  },
  ApiResult,
};

const CONTEXT_PATH_WITHOUT_ID: &str = "/projects/{project_id}/apps";

#[utoipa::path(
  context_path = CONTEXT_PATH_WITHOUT_ID,
  params(ProjectPath),
  responses(
    AppServicesList,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[get("/")]
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
  context_path = CONTEXT_PATH_WITHOUT_ID,
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
#[post("/")]
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
    public_domain,
    private_domain,
  } = app;

  let app = sqlx::query_as!(
    AppService,
    "INSERT INTO app_services(app_name, replicas, image, port, public_domain, private_domain, project_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    name,
    replicas,
    image,
    port,
    public_domain.subdomain,
    private_domain.subdomain,
    project_id
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(app)
}

pub fn config_without_id(cfg: &mut ServiceConfig) {
  cfg.service(list_apps).service(create_app);
}

const CONTEXT_PATH_WITH_ID: &str = "/projects/{project_id}/apps/{app_id}";

#[utoipa::path(
  context_path = CONTEXT_PATH_WITH_ID,
  params(AppPath),
  responses(
    AppService,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[get("/")]
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
  context_path = CONTEXT_PATH_WITH_ID,
  params(AppPath),
  responses(
    AppStatus,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[get("/status/")]
pub async fn get_app_status(path: Path<AppPath>) -> ApiResult<impl Responder> {
  let AppPath {
    project_id: _,
    app_id,
  } = *path;

  let stream = k8s::app_status(&app_id).await?.map_ok(|status| {
    sse::Event::Data(
      sse::Data::new_json(status)
        .expect("Invalid app status json")
        .event("message"),
    )
  });

  Ok(sse::Sse::from_stream(stream))
}

#[utoipa::path(
  context_path = CONTEXT_PATH_WITH_ID,
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
#[patch("/")]
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
    public_domain,
    private_domain,
  } = app;

  let app = sqlx::query_as!(
    AppService,
    r#"
    UPDATE app_services
    SET app_name = COALESCE($1, app_name),
      replicas = COALESCE($2, replicas),
      image = COALESCE($3, image),
      port = COALESCE($4, port),
      public_domain = (CASE WHEN $5 = true THEN $6 ELSE public_domain END),
      private_domain = (CASE WHEN $7 = true THEN $8 ELSE private_domain END)
    WHERE project_id = $9 AND app_id = $10
    RETURNING *
    "#,
    name,
    replicas,
    image,
    port,
    public_domain.is_some(),
    public_domain.map(|domain| domain.subdomain).unwrap_or(None),
    private_domain.is_some(),
    private_domain
      .map(|domain| domain.subdomain)
      .unwrap_or(None),
    project_id,
    app_id
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(app)
}

#[utoipa::path(
  context_path = CONTEXT_PATH_WITH_ID,
  params(AppPath),
  responses(
    AppService,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[delete("/")]
pub async fn delete_app(path: Path<AppPath>, pool: Pool) -> ApiResult<AppService> {
  let AppPath { project_id, app_id } = *path;

  let app = sqlx::query_as!(
    AppService,
    "UPDATE app_services SET deleted = true WHERE project_id = $1 AND app_id = $2 RETURNING *",
    project_id,
    app_id,
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(app)
}

#[utoipa::path(
  context_path = CONTEXT_PATH_WITH_ID,
  params(AppPath),
  responses(
    AppService,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[post("/recover/")]
pub async fn recover_app(path: Path<AppPath>, pool: Pool) -> ApiResult<AppService> {
  let AppPath { project_id, app_id } = *path;

  let app = sqlx::query_as!(
    AppService,
    "UPDATE app_services SET deleted = false WHERE project_id = $1 AND app_id = $2 RETURNING *",
    project_id,
    app_id,
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(app)
}

pub fn config_with_id(cfg: &mut ServiceConfig) {
  cfg
    .service(get_app)
    .service(get_app_status)
    .service(update_app)
    .service(delete_app)
    .service(recover_app);
}
