use crate::auth::{Password, Token, API_KEY};
use crate::error;
use crate::routes::*;
use crate::schemas;
use utoipa::openapi::security::ApiKey;
use utoipa::openapi::security::ApiKeyValue;
use utoipa::openapi::security::SecurityScheme;
use utoipa::Modify;
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(
  modifiers(&ApiKeySecurity),
  security(("api_key" = [])),
  paths(
    auth::register,
    auth::login,
    project::list_projects,
    project::create_project,
    project::get_project,
    project::update_project,
    project::delete_project,
    project::release_project,
    app::list_apps,
    app::create_app,
    app::get_app,
    app::update_app,
    app::delete_app,
    app::recover_app,
  ),
  components(schemas(
    error::ApiError,
    error::ErrorMessage,
    Password,
    Token,
    schemas::User,
    schemas::AuthData,
    schemas::AuthResponse,
    schemas::ProjectSchema,
    schemas::PartialProjectSchema,
    schemas::AppService,
    schemas::DomainName,
    schemas::AppServiceSchema,
    schemas::PartialAppServiceSchema,
  ))
)]
pub struct OpenApiSpec;

struct ApiKeySecurity;

impl Modify for ApiKeySecurity {
  fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
    if let Some(components) = openapi.components.as_mut() {
      components.add_security_scheme(
        "api_key",
        SecurityScheme::ApiKey(ApiKey::Header(ApiKeyValue::with_description(
          API_KEY.as_str(),
          "token for protected content access",
        ))),
      )
    }
  }
}
