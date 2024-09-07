use api::AppConfig;
use confique::Config;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
  AppConfig::builder().env().load().unwrap().build()?.await
}
