use getrandom::getrandom;
use hex::FromHex;
use serde::Serialize;
use sha2::{Digest, Sha256};

use crate::utils;

use super::{AuthError, AuthResult, AuthSecurity};

#[derive(Serialize)]
#[serde(transparent)]
pub struct Token(#[serde(serialize_with = "utils::as_hex")] [u8; Self::LENGTH]);

impl Token {
  const LENGTH: usize = 32;

  fn internal_hash(&self) -> String {
    let token_hash = Sha256::digest(self.0);

    hex::encode(token_hash)
  }

  pub fn generate() -> AuthResult<Self> {
    let mut buffer = [0u8; Self::LENGTH];

    getrandom(&mut buffer).map_err(|err| AuthError::Other(Box::new(err)))?;

    Ok(Self(buffer))
  }
}

impl AuthSecurity for Token {
  fn hash(&self) -> AuthResult<String> {
    Ok(self.internal_hash())
  }
  fn verify(&self, hash: &str) -> AuthResult<()> {
    let token_hash = self.internal_hash();

    if token_hash != hash {
      return Err(AuthError::Invalid);
    }

    Ok(())
  }
}

impl FromHex for Token {
  type Error = AuthError;

  fn from_hex<T: AsRef<[u8]>>(hex: T) -> Result<Self, Self::Error> {
    let mut bytes = [0u8; Self::LENGTH];

    hex::decode_to_slice(hex, &mut bytes).map_err(|err| AuthError::Other(Box::new(err)))?;

    Ok(Self(bytes))
  }
}
