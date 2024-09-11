use argon2::{
  password_hash::{self, rand_core::OsRng, PasswordHasher, SaltString},
  Argon2, PasswordHash, PasswordVerifier,
};
use confique::Config;
use derive_more::derive::{Deref, From};
use serde::Deserialize;
use std::sync::LazyLock;
use utoipa::ToSchema;
use validator::Validate;

use crate::utils;

use super::{AuthError, AuthResult, AuthSecurity};

#[derive(Config)]
struct ArgonConfig {
  #[config(env = "PASSWORD_SECRET", default = "secret")]
  secret: String,
}

static PASSWORD_SECRET: LazyLock<String> =
  LazyLock::new(|| ArgonConfig::builder().env().load().unwrap().secret);

static ARGON: LazyLock<Argon2<'static>> = LazyLock::new(|| {
  Argon2::new_with_secret(
    PASSWORD_SECRET.as_bytes(),
    Default::default(),
    Default::default(),
    Default::default(),
  )
  .unwrap()
});

#[derive(Deref, From, Deserialize, Validate, ToSchema)]
#[from(String, &str)]
pub struct Password {
  #[deref]
  #[serde(rename = "password", deserialize_with = "utils::trim_string")]
  #[validate(length(min = 1))]
  value: String,
}

impl From<password_hash::Error> for AuthError {
  fn from(err: password_hash::Error) -> Self {
    match err {
      password_hash::Error::Password => AuthError::Invalid,
      err => AuthError::Other(Box::new(err)),
    }
  }
}

impl AuthSecurity for Password {
  fn hash(&self) -> AuthResult<String> {
    let salt = SaltString::generate(&mut OsRng);

    let hash = ARGON
      .hash_password(self.value.as_bytes(), &salt)?
      .to_string();

    Ok(hash)
  }
  fn verify(&self, hash: &str) -> AuthResult<()> {
    let hash = PasswordHash::new(hash)?;

    ARGON.verify_password(self.value.as_bytes(), &hash)?;

    Ok(())
  }
}
