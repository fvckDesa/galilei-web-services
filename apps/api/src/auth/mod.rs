mod password;
mod token;

use actix_web::http::header::HeaderName;
use derive_more::derive::{Display, Error};
use std::error::Error;

pub use password::Password;
pub use token::Token;

pub const API_KEY: HeaderName = HeaderName::from_static("x-api-key");

#[derive(Debug, Display, Error)]
pub enum AuthError {
  Invalid,
  #[display("{}", _0.to_string())]
  Other(Box<dyn Error>),
}

type AuthResult<T, E = AuthError> = Result<T, E>;

pub trait AuthSecurity {
  fn hash(&self) -> AuthResult<String>;
  fn verify(&self, hash: &str) -> AuthResult<()>;
}
