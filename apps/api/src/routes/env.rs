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
  schemas::{AppPath, EnvList, EnvPath, EnvSchema, EnvVar, PartialEnvSchema},
  ApiResult,
};

const CONTEXT_PATH: &str = "/projects/{project_id}/apps/{app_id}";

#[utoipa::path(
  context_path = CONTEXT_PATH,
  params(AppPath),
  responses(
    EnvList,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[get("/envs/")]
pub async fn list_envs(path: Path<AppPath>, pool: Pool) -> ApiResult<EnvList> {
  let envs = sqlx::query_as!(EnvVar, "SELECT * FROM envs WHERE app_id = $1", path.app_id)
    .fetch_all(pool.as_ref())
    .await?;

  Ok(EnvList::from(envs))
}

#[utoipa::path(
  context_path = CONTEXT_PATH,
  params(AppPath),
  responses(
    EnvVar,
    BadRequestErrorMessage,
    NotFoundErrorMessage,
    AlreadyExistsErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[post("/envs/")]
pub async fn create_env(
  path: Path<AppPath>,
  Json(env): Json<EnvSchema>,
  pool: Pool,
) -> ApiResult<EnvVar> {
  let env = sqlx::query_as!(
    EnvVar,
    "INSERT INTO envs(env_name, env_value, app_id) VALUES ($1, $2, $3) RETURNING *",
    env.name,
    env.value,
    path.app_id
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(env)
}

#[utoipa::path(
  context_path = CONTEXT_PATH,
  params(EnvPath),
  responses(
    EnvVar,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[get("/envs/{env_id}/")]
pub async fn get_env(path: Path<EnvPath>, pool: Pool) -> ApiResult<EnvVar> {
  let env = sqlx::query_as!(
    EnvVar,
    "SELECT * FROM envs WHERE app_id = $1 AND env_id = $2",
    path.app_id,
    path.env_id
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(env)
}

#[utoipa::path(
  context_path = CONTEXT_PATH,
  params(EnvPath),
  responses(
    EnvVar,
    BadRequestErrorMessage,
    NotFoundErrorMessage,
    AlreadyExistsErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[patch("/envs/{env_id}/")]
pub async fn update_env(
  path: Path<EnvPath>,
  Json(env): Json<PartialEnvSchema>,
  pool: Pool,
) -> ApiResult<EnvVar> {
  let env = sqlx::query_as!(
    EnvVar,
    r#"
    UPDATE envs
    SET env_name = COALESCE($1, env_name),
      env_value = COALESCE($2, env_value)
    WHERE app_id = $3 AND env_id = $4
    RETURNING *
    "#,
    env.name,
    env.value,
    path.app_id,
    path.env_id
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(env)
}

#[utoipa::path(
  context_path = CONTEXT_PATH,
  params(EnvPath),
  responses(
    EnvVar,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    InternalServerErrorMessage
  )
)]
#[delete("/envs/{env_id}/")]
pub async fn delete_env(path: Path<EnvPath>, pool: Pool) -> ApiResult<EnvVar> {
  let app = sqlx::query_as!(
    EnvVar,
    "DELETE FROM envs WHERE app_id = $1 AND env_id = $2 RETURNING *",
    path.app_id,
    path.env_id,
  )
  .fetch_one(pool.as_ref())
  .await?;

  Ok(app)
}

pub fn config(cfg: &mut ServiceConfig) {
  cfg
    .service(list_envs)
    .service(create_env)
    .service(get_env)
    .service(update_env)
    .service(delete_env);
}
