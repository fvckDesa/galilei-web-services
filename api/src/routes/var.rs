use actix_web::{
  delete, get,
  http::StatusCode,
  post, put,
  web::{Json, Path, ServiceConfig},
};
use derive_more::From;
use serde::Serialize;
use validator::Validate;

use crate::{database::Transaction, error::UnauthorizeResponse};
use crate::{
  error::{
    AlreadyExistsResponse, ApiResult, InternalErrorResponse, NotFoundResponse, ValidationResponse,
  },
  models::var::{CreateVariableData, UpdateVariableData, VariablePath},
};
use crate::{impl_json_responder, models::var::Variable};
use crate::{
  k8s::{ResourceBind, VariableRequestResolver},
  models::{star::StarPath, CrudOperations},
};

#[derive(Serialize, From, utoipa::ToResponse)]
#[response(
  description = "all variables of a star",
  content_type = "application/json"
)]
#[serde(transparent)]
pub struct StarVariablesList(Vec<Variable>);
impl_json_responder!(StarVariablesList, StatusCode::OK);

#[utoipa::path(
  params(StarPath),
  responses(
    (status = OK, response = StarVariablesList),
    (status = NOT_FOUND, response = NotFoundResponse),
    (status = UNAUTHORIZED, response = UnauthorizeResponse),
    (status = INTERNAL_SERVER_ERROR, response = InternalErrorResponse)
  )
)]
#[get("/galaxies/{galaxy_id}/stars/{star_id}/vars")]
pub async fn get_all_star_vars(
  mut tx: Transaction,
  path: Path<StarPath>,
) -> ApiResult<StarVariablesList> {
  let vars = Variable::all(&mut tx, &path).await?;

  Ok(StarVariablesList::from(vars))
}

#[derive(Serialize, From, utoipa::ToResponse)]
#[response(
  description = "star variable successfully created",
  content_type = "application/json"
)]
#[serde(transparent)]
pub struct StarVariableCreated(Variable);
impl_json_responder!(StarVariableCreated, StatusCode::CREATED);

#[utoipa::path(
  params(StarPath),
  request_body(
    content = CreateVariableData,
    description = "data for creating the star",
    content_type = "application/json"
  ),
  responses(
    (status = OK, response = StarVariableCreated),
    (status = NOT_FOUND, response = NotFoundResponse),
    (status = CONFLICT, response = AlreadyExistsResponse),
    (status = BAD_REQUEST, response = ValidationResponse),
    (status = UNAUTHORIZED, response = UnauthorizeResponse),
    (status = INTERNAL_SERVER_ERROR, response = InternalErrorResponse)
  )
)]
#[post("/galaxies/{galaxy_id}/stars/{star_id}/vars")]
pub async fn create_star_var(
  mut tx: Transaction,
  path: Path<StarPath>,
  Json(data): Json<CreateVariableData>,
) -> ApiResult<StarVariableCreated> {
  data.validate()?;

  let var = <Variable as CrudOperations>::create(&mut tx, &path, &data).await?;

  ResourceBind::create(&var, VariableRequestResolver::try_default(path.0).await?).await?;

  Ok(StarVariableCreated::from(var))
}

#[derive(Serialize, From, utoipa::ToResponse)]
#[response(
  description = "specific star variable",
  content_type = "application/json"
)]
pub struct SpecificStarVariable(Variable);
impl_json_responder!(SpecificStarVariable, StatusCode::OK);

#[utoipa::path(
  params(VariablePath),
  responses(
    (status = OK, response = SpecificStarVariable),
    (status = NOT_FOUND, response = NotFoundResponse),
    (status = CONFLICT, response = AlreadyExistsResponse),
    (status = BAD_REQUEST, response = ValidationResponse),
    (status = UNAUTHORIZED, response = UnauthorizeResponse),
    (status = INTERNAL_SERVER_ERROR, response = InternalErrorResponse)
  )
)]
#[get("/galaxies/{galaxy_id}/stars/{star_id}/vars/{variable_id}")]
pub async fn get_star_var(
  mut tx: Transaction,
  path: Path<VariablePath>,
) -> ApiResult<SpecificStarVariable> {
  let planet = Variable::get(&mut tx, &path).await?;

  Ok(SpecificStarVariable::from(planet))
}

#[derive(Serialize, From, utoipa::ToResponse)]
#[response(
  description = "star variable successfully updated",
  content_type = "application/json"
)]
#[serde(transparent)]
pub struct StarVariableUpdated(Variable);
impl_json_responder!(StarVariableUpdated, StatusCode::OK);

#[utoipa::path(
  params(VariablePath),
  request_body(
    content = UpdateStarData,
    description = "data for updating the star",
    content_type = "application/json"
  ),
  responses(
    (status = OK, response = StarVariableUpdated),
    (status = NOT_FOUND, response = NotFoundResponse),
    (status = CONFLICT, response = AlreadyExistsResponse),
    (status = BAD_REQUEST, response = ValidationResponse),
    (status = UNAUTHORIZED, response = UnauthorizeResponse),
    (status = INTERNAL_SERVER_ERROR, response = InternalErrorResponse)
  )
)]
#[put("/galaxies/{galaxy_id}/stars/{star_id}/vars/{variable_id}")]
pub async fn update_star_var(
  mut tx: Transaction,
  path: Path<VariablePath>,
  Json(data): Json<UpdateVariableData>,
) -> ApiResult<StarVariableUpdated> {
  data.validate()?;

  let var = <Variable as CrudOperations>::update(&mut tx, &path, &data).await?;

  ResourceBind::update(&var, VariableRequestResolver::try_default(path.0).await?).await?;

  Ok(StarVariableUpdated::from(var))
}

#[derive(Serialize, From, utoipa::ToResponse)]
#[response(
  description = "star variable successfully deleted",
  content_type = "application/json"
)]
#[serde(transparent)]
pub struct StarVariableDeleted(Variable);
impl_json_responder!(StarVariableDeleted, StatusCode::OK);

#[utoipa::path(
  params(VariablePath),
  responses(
    (status = OK, response = StarVariableDeleted),
    (status = NOT_FOUND, response = NotFoundResponse),
    (status = UNAUTHORIZED, response = UnauthorizeResponse),
    (status = INTERNAL_SERVER_ERROR, response = InternalErrorResponse)
  )
)]
#[delete("/galaxies/{galaxy_id}/stars/{star_id}/vars/{variable_id}")]
pub async fn delete_star_var(
  mut tx: Transaction,
  path: Path<VariablePath>,
) -> ApiResult<StarVariableDeleted> {
  let var = <Variable as CrudOperations>::delete(&mut tx, &path).await?;

  ResourceBind::delete(&var, VariableRequestResolver::try_default(path.0).await?).await?;

  Ok(StarVariableDeleted::from(var))
}

pub fn config(cfg: &mut ServiceConfig) {
  cfg
    .service(get_all_star_vars)
    .service(get_star_var)
    .service(create_star_var)
    .service(update_star_var)
    .service(delete_star_var);
}
