use confique::Config;
use sqlx::postgres::{PgPool, PgPoolOptions};

pub mod entities;

#[derive(Config)]
pub struct DatabaseConfig {
  #[config(
    env = "DATABASE_URL",
    default = "postgresql://postgres:postgres@localhost:5432/gws"
  )]
  url: String,
  #[config(env = "DATABASE_MAX_CONNECTIONS", default = 10)]
  max_connections: u32,
}

impl DatabaseConfig {
  pub fn from_env() -> Result<Self, confique::Error> {
    Self::builder().env().load()
  }

  pub async fn create_pool(self) -> Result<PgPool, sqlx::Error> {
    let pool = PgPoolOptions::new()
      .max_connections(self.max_connections)
      .connect_lazy(&self.url)?;

    log::info!("Connected with database {}", self.url);

    sqlx::migrate!("./migrations")
      .run(&pool)
      .await
      .map_err(sqlx::Error::from)?;

    Ok(pool)
  }
}
