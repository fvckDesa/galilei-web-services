use std::net::IpAddr;

use actix_web::{dev::Server, middleware::NormalizePath, App, HttpServer};
use actix_web_validator::JsonConfig;
use confique::Config;

use crate::{
  routes::{app, auth, project},
  ApiError,
};

#[derive(Config)]
pub struct AppConfig {
  #[config(env = "APP_ADDRESS", default = "127.0.0.1")]
  address: IpAddr,
  #[config(env = "APP_PORT", default = 8000)]
  port: u16,
}

impl AppConfig {
  pub fn from_env() -> Result<Self, confique::Error> {
    Self::builder().env().load()
  }

  pub fn build(self) -> std::io::Result<Server> {
    let server = HttpServer::new(move || {
      App::new()
        .app_data(JsonConfig::default().error_handler(|err, _| ApiError::from(err).into()))
        .wrap(NormalizePath::trim())
        .configure(auth::config)
        .configure(project::config)
        .configure(app::config)
    })
    .bind((self.address, self.port))?
    .run();

    Ok(server)
  }
}
