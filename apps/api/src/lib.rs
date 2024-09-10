mod app;
mod database;
mod error;
mod openapi;

pub(crate) mod auth;
pub(crate) mod routes;
pub(crate) mod utils;

pub use app::AppConfig;
pub use database::DatabaseConfig;
pub use error::{ApiError, ApiResult};
pub use openapi::OpenApiSpec;

pub use app::create_app;
pub use auth::{middleware, UserId};
pub use database::MIGRATOR;
