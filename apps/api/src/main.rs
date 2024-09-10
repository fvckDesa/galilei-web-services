use api::AppConfig;
use confique::Config;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
  env_logger::init();

  let app_config = AppConfig::builder()
    .env()
    .load()
    .expect("Unable to get app config");

  let server = app_config
    .build()
    .await
    .expect("unable to create http server");

  log::info!(
    "Server listening on http://{}:{}",
    app_config.address(),
    app_config.port()
  );

  server.await
}
