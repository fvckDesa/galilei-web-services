use actix_web::{FromRequest, HttpMessage};
use derive_more::derive::{Deref, From};
use std::{
  future::{ready, Ready},
  sync::Arc,
};
use uuid::Uuid;

#[derive(Clone, Debug, From, Deref)]
#[deref(forward)]
#[from(forward)]
pub struct UserId(Arc<Uuid>);

impl FromRequest for UserId {
  type Error = actix_web::Error;
  type Future = Ready<Result<Self, Self::Error>>;

  fn from_request(req: &actix_web::HttpRequest, _: &mut actix_web::dev::Payload) -> Self::Future {
    let extensions = req.extensions();
    let user_id = extensions.get::<UserId>().expect("UserId not found");

    ready(Ok(user_id.clone()))
  }
}
