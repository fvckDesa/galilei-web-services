use std::net::IpAddr;

use actix_web::{
  body::MessageBody,
  dev::{Server, ServiceFactory, ServiceResponse},
  middleware::{self, NormalizePath},
  web::{self, Data},
  App, HttpServer,
};
use actix_web_validator::JsonConfig;
use confique::Config;

use crate::{
  auth,
  routes::{app, auth as auth_routes, project},
  ApiError, DatabaseConfig,
};

#[derive(Config)]
pub struct AppConfig {
  #[config(env = "APP_ADDRESS", default = "127.0.0.1")]
  address: IpAddr,
  #[config(env = "APP_PORT", default = 8000)]
  port: u16,
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
    .wrap(NormalizePath::trim())
    .configure(auth_routes::config)
    .service(
      web::scope("")
        .wrap(middleware::from_fn(auth::middleware))
        .configure(project::config)
        .configure(app::config),
    )
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
