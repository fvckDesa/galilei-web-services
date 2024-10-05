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
  schemas::{PartialVolumeSchema, ProjectPath, Volume, VolumePath, VolumeSchema, VolumesList},
  ApiError, ApiResult,
};

const CONTEXT_PATH: &str = "/projects/{project_id}";

#[utoipa::path(
  context_path = CONTEXT_PATH,
  params(ProjectPath),
  responses(
    VolumesList,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[get("/volumes/")]
pub async fn list_volumes(path: Path<ProjectPath>, pool: Pool) -> ApiResult<VolumesList> {
  let volumes = sqlx::query_as!(
    Volume,
    "SELECT * FROM volumes WHERE project_id = $1",
    path.project_id
  )
  .fetch_all(pool.as_ref())
  .await?;

  Ok(VolumesList::from(volumes))
}

#[utoipa::path(
  context_path = CONTEXT_PATH,
  params(ProjectPath),
  responses(
    Volume,
    BadRequestErrorMessage,
    NotFoundErrorMessage,
    AlreadyExistsErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[post("/volumes/")]
pub async fn create_volume(
  path: Path<ProjectPath>,
  Json(volume): Json<VolumeSchema>,
  pool: Pool,
) -> ApiResult<Volume> {
  // check if the app is in the same project of
  if let Some(app_id) = &volume.app.id {
    let is_same_project = sqlx::query!(
      "SELECT 1 as ok FROM app_services WHERE project_id = $1 AND app_id = $2",
      path.project_id,
      app_id
    )
    .fetch_optional(pool.as_ref())
    .await?;

    if is_same_project.is_none() {
      return Err(ApiError::NotFound);
    }
  }

  let volume = sqlx::query_as!(
    Volume,
    "INSERT INTO volumes(volume_name, capacity, path, app_id, project_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    volume.name,
    volume.capacity,
    volume.path,
    volume.app.id,
    path.project_id
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(volume)
}

#[utoipa::path(
  context_path = CONTEXT_PATH,
  params(VolumePath),
  responses(
    Volume,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[get("/volumes/{volume_id}/")]
pub async fn get_volume(path: Path<VolumePath>, pool: Pool) -> ApiResult<Volume> {
  let volume = sqlx::query_as!(
    Volume,
    "SELECT * FROM volumes WHERE project_id = $1 AND volume_id = $2",
    path.project_id,
    path.volume_id
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(volume)
}

#[utoipa::path(
  context_path = CONTEXT_PATH,
  params(VolumePath),
  responses(
    Volume,
    BadRequestErrorMessage,
    NotFoundErrorMessage,
    AlreadyExistsErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[patch("/volumes/{volume_id}/")]
pub async fn update_volume(
  path: Path<VolumePath>,
  Json(volume): Json<PartialVolumeSchema>,
  pool: Pool,
) -> ApiResult<Volume> {
  let app_id = volume.app.as_ref().map(|app| app.id).unwrap_or(None);
  // check if the app is in the same project of
  if let Some(app_id) = &app_id {
    let is_same_project = sqlx::query!(
      "SELECT 1 as ok FROM app_services WHERE project_id = $1 AND app_id = $2",
      path.project_id,
      app_id
    )
    .fetch_optional(pool.as_ref())
    .await?;

    if is_same_project.is_none() {
      return Err(ApiError::NotFound);
    }
  }

  let volume = sqlx::query_as!(
    Volume,
    r#"
    UPDATE volumes
    SET volume_name = COALESCE($1, volume_name),
      capacity = COALESCE($2, capacity),
      path = COALESCE($3, path),
      app_id = (CASE WHEN $4 = true THEN $5 ELSE app_id END)
    WHERE project_id = $6 AND volume_id = $7
    RETURNING *
    "#,
    volume.name,
    volume.capacity,
    volume.path,
    volume.app.is_some(),
    app_id,
    path.project_id,
    path.volume_id
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(volume)
}

#[utoipa::path(
  context_path = CONTEXT_PATH,
  params(VolumePath),
  responses(
    Volume,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[delete("/volumes/{volume_id}/")]
pub async fn delete_volume(path: Path<VolumePath>, pool: Pool) -> ApiResult<Volume> {
  let app = sqlx::query_as!(
    Volume,
    "UPDATE volumes SET deleted = true WHERE project_id = $1 AND volume_id = $2 RETURNING *",
    path.project_id,
    path.volume_id,
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(app)
}

#[utoipa::path(
  context_path = CONTEXT_PATH,
  params(VolumePath),
  responses(
    Volume,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[delete("/volumes/{volume_id}/recover/")]
pub async fn recover_volume(path: Path<VolumePath>, pool: Pool) -> ApiResult<Volume> {
  log::debug!("Found {path:?}");
  let app = sqlx::query_as!(
    Volume,
    "UPDATE volumes SET deleted = false WHERE project_id = $1 AND volume_id = $2 RETURNING *",
    path.project_id,
    path.volume_id,
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(app)
}

pub fn config(cfg: &mut ServiceConfig) {
  cfg
    .service(list_volumes)
    .service(create_volume)
    .service(get_volume)
    .service(update_volume)
    .service(delete_volume)
    .service(recover_volume);
}
