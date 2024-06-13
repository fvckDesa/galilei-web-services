use actix_cors::Cors;
use actix_web::{
  middleware::{Logger, NormalizePath},
  web, App, HttpServer,
};
use api::{auth::AuthService, database::TransactionService};
use dotenv::dotenv;
use std::{env, sync::Arc};

const MAX_CONNECTIONS: u32 = 10;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
  env::set_var("RUST_LOG", "debug");
  env::set_var("RUST_BACKTRACE", "1");

  dotenv().ok();

  env_logger::init();

  let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

  let pool = api::database::create_pool(&database_url, MAX_CONNECTIONS)
    .await
    .expect("Unable connect to database");

  HttpServer::new(move || {
    let cors = Cors::default()
      .allowed_origin("http://localhost:3000")
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
  .bind(("127.0.0.1", 8080))?
  .run()
  .await
}
