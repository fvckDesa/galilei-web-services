mod app;
mod database;
mod error;
mod openapi;

pub(crate) mod auth;
pub(crate) mod k8s;
pub(crate) mod middleware;
pub(crate) mod routes;
pub(crate) mod utils;

pub mod schemas;

pub use app::{create_app, AppConfig};
pub use auth::{AuthSecurity, Password, Token, API_KEY};
pub use database::{DatabaseConfig, MIGRATOR};
pub use error::{ApiError, ApiResult};
pub use openapi::OpenApiSpec;
