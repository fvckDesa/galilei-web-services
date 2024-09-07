pub mod app;
pub mod auth;
pub mod project;

#[macro_export]
macro_rules! impl_json_response {
  ($type:ty) => {
    impl_json_response!($type, actix_web::http::StatusCode::OK);
  };
  ($type:ty, $status_code:expr) => {
    impl actix_web::Responder for $type {
      type Body = actix_web::body::BoxBody;

      fn respond_to(self, _req: &actix_web::HttpRequest) -> actix_web::HttpResponse<Self::Body> {
        actix_web::HttpResponse::build($status_code).json(self)
      }
    }
  };
}
