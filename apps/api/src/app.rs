use std::net::IpAddr;

use actix_web::{
  body::MessageBody,
  dev::{Server, ServiceFactory, ServiceResponse},
  middleware::{self, NormalizePath},
  web::{self, Data},
  App, HttpResponse, HttpServer, ResponseError,
};
use actix_web_validator::JsonConfig;
use confique::Config;

use crate::{
  middleware::{project_middleware, session_middleware},
  routes::{app, auth as auth_routes, project},
  ApiError, DatabaseConfig,
};

#[derive(Config)]
pub struct AppConfig {
  #[config(env = "SERVER_ADDRESS", default = "127.0.0.1")]
  address: IpAddr,
  #[config(env = "SERVER_PORT", default = 8000)]
  port: u16,
}

async fn default_route() -> HttpResponse {
  ApiError::NotFound.error_response()
}

pub fn create_app(
  pool: sqlx::PgPool,
) -> App<
  impl ServiceFactory<
    actix_web::dev::ServiceRequest,
    Config = (),
    Response = ServiceResponse<impl MessageBody>,
    Error = actix_web::Error,
    InitError = (),
  >,
> {
  App::new()
    .app_data(JsonConfig::default().error_handler(|err, _| ApiError::from(err).into()))
    .app_data(Data::new(pool))
    .wrap(NormalizePath::new(middleware::TrailingSlash::Always))
    .service(web::scope("/auth").configure(auth_routes::config))
    .service(
      web::scope("/projects")
        .wrap(middleware::from_fn(session_middleware))
        .configure(project::config_without_id)
        .service(
          web::scope("/{project_id}")
            .wrap(middleware::from_fn(project_middleware))
            .configure(project::config_with_id)
            .configure(app::config),
        ),
    )
    .default_service(web::to(default_route))
}

impl AppConfig {
  pub fn from_env() -> Result<Self, confique::Error> {
    Self::builder().env().load()
  }

  pub async fn build(&self) -> anyhow::Result<Server> {
    let pool = DatabaseConfig::from_env()?.create_pool().await?;

    let server = HttpServer::new(move || create_app(pool.clone()))
      .bind((self.address, self.port))?
      .run();

    Ok(server)
  }

  pub fn address(&self) -> &IpAddr {
    &self.address
  }

  pub fn port(&self) -> u16 {
    self.port
  }
}
