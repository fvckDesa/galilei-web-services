use std::{env, net, sync::OnceLock};

pub static CONFIG: OnceLock<Config> = OnceLock::new();

#[derive(Debug)]
pub struct Config {
  pub socket: net::SocketAddrV4,
  pub host_domain: String,
  pub cookie_domain: String,
  pub database_url: String,
  pub web_origin: String,
  pub dynamic_storage_active: bool,
}

impl Config {
  pub fn new() -> Self {
    let address = env::var("ADDRESS").unwrap_or("127.0.0.1".to_string());
    let port = env::var("PORT").unwrap_or("8080".to_string());

    let host_domain = env::var("HOST_DOMAIN").unwrap_or("localhost".to_string());

    let cookie_domain = env::var("COOKIE_DOMAIN").unwrap_or("localhost".to_string());

    let web_origin = env::var("WEB_ORIGIN").unwrap_or("http://localhost:3000".to_string());

    let database_url = env::var("DATABASE_URL")
      .unwrap_or("postgresql://postgres:postgres@localhost:5432/gws".to_string());

    let dynamic_storage_active = env::var("DYNAMIC_STORAGE_ACTIVE")
      .unwrap_or("false".to_string())
      .to_lowercase()
      == "true";

    Self {
      socket: format!("{address}:{port}").parse().expect("Invalid socket"),
      host_domain,
      cookie_domain,
      web_origin,
      database_url,
      dynamic_storage_active,
    }
  }
}
