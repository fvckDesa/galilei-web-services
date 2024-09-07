use crate::database::entities;
use crate::error;
use crate::routes::*;
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(
  paths(
    auth::register,
    auth::login,
    project::list_projects,
    project::create_project,
    project::get_project,
    project::update_project,
    project::delete_project,
    app::list_apps,
    app::create_app,
    app::get_app,
    app::update_app,
    app::delete_app,
  ),
  components(schemas(
    error::ErrorMessage,
    entities::User,
    entities::Session,
    auth::Credentials,
    project::ProjectSpec,
    app::AppServiceSpec
  ))
)]
pub struct OpenApiSpec;
