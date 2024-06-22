use actix_cors::Cors;
use actix_web::{
  middleware::{Logger, NormalizePath},
  web, App, HttpServer,
};
use api::{auth::AuthService, database::TransactionService};
use std::{env, sync::Arc};

const MAX_CONNECTIONS: u32 = 10;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
  env::set_var("RUST_LOG", "debug");
  env::set_var("RUST_BACKTRACE", "1");

  dotenv::dotenv().ok();

  let config = api::config::CONFIG.get_or_init(|| api::config::Config::new());

  env_logger::init();

  let pool = api::database::create_pool(&config.database_url, MAX_CONNECTIONS)
    .await
    .expect("Unable connect to database");

  HttpServer::new(move || {
    let cors = Cors::default()
      .allowed_origin(&config.web_origin)
      .supports_credentials();

    App::new()
      .wrap(NormalizePath::trim())
      .wrap(TransactionService::new(Arc::clone(&pool)))
      .wrap(cors)
      .configure(api::routes::auth::config)
      .service(
        web::scope("")
          .wrap(AuthService::new(Arc::clone(&pool)))
          .configure(api::routes::user::config)
          .configure(api::routes::galaxy::config)
          .configure(api::routes::star::config)
          .configure(api::routes::var::config)
          .configure(api::routes::planet::config),
      )
      .wrap(Logger::default())
  })
  .bind(&config.socket)?
  .run()
  .await
}
