use crate::{auth, error, models, routes};
use utoipa::{
  openapi::security::{ApiKey, ApiKeyValue, SecurityScheme},
  Modify, OpenApi,
};

struct SecurityAddon;

impl Modify for SecurityAddon {
  fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
    if let Some(schema) = openapi.components.as_mut() {
      schema.add_security_scheme(
        "session_token",
        SecurityScheme::ApiKey(ApiKey::Cookie(ApiKeyValue::new("session"))),
      );
    }
  }
}
#[derive(OpenApi)]
#[openapi(
  modifiers(&SecurityAddon),
  security(
    ("session_token" = [])
  ),
  paths(
    routes::auth::register,
    routes::auth::login,
    routes::auth::verify,
    routes::auth::logout,
    routes::user::me,
    routes::galaxy::get_all_galaxies,
    routes::galaxy::get_galaxy,
    routes::galaxy::create_galaxy,
    routes::galaxy::update_galaxy,
    routes::galaxy::delete_galaxy,
    routes::star::get_all_stars,
    routes::star::get_star,
    routes::star::create_star,
    routes::star::update_star,
    routes::star::delete_star,
    routes::var::get_all_star_vars,
    routes::var::get_star_var,
    routes::var::create_star_var,
    routes::var::update_star_var,
    routes::var::delete_star_var,
    routes::planet::get_all_planets,
    routes::planet::get_planet,
    routes::planet::create_planet,
    routes::planet::update_planet,
    routes::planet::delete_planet,
  ),
  components(
    schemas(
      error::ErrorMessage,
      routes::auth::AuthData,
      routes::star::StarStatus,
      models::user::User,
      auth::Password,
      models::user::Credentials,
      models::galaxy::Galaxy,
      models::galaxy::CreateGalaxyData,
      models::galaxy::UpdateGalaxyData,
      models::star::Star,
      models::star::DomainName,
      models::star::CreateStarData,
      models::star::UpdateStarData,
      models::var::Variable,
      models::var::CreateVariableData,
      models::var::UpdateVariableData,
      models::planet::Planet,
      models::planet::ConnectPlanetToStar,
      models::planet::CreatePlanetData,
      models::planet::UpdatePlanetData,
    ),
    responses(
      error::UnauthorizeResponse,
      error::NotFoundResponse,
      error::AlreadyExistsResponse,
      error::ValidationResponse,
      error::InternalErrorResponse,
      routes::auth::AuthResponse,
      routes::user::UserResponse,
      routes::galaxy::GalaxiesList,
      routes::galaxy::SpecificGalaxy,
      routes::galaxy::GalaxyCreated,
      routes::galaxy::GalaxyUpdated,
      routes::galaxy::GalaxyDeleted,
      routes::star::StarsList,
      routes::star::SpecificStar,
      routes::star::StarCreated,
      routes::star::StarUpdated,
      routes::star::StarDeleted,
      routes::var::StarVariablesList,
      routes::var::SpecificStarVariable,
      routes::var::StarVariableCreated,
      routes::var::StarVariableUpdated,
      routes::var::StarVariableDeleted,
      routes::planet::PlanetsList,
      routes::planet::SpecificPlanet,
      routes::planet::PlanetCreated,
      routes::planet::PlanetUpdated,
      routes::planet::PlanetDeleted,
    )
  )
)]
pub struct ApiSpec;
