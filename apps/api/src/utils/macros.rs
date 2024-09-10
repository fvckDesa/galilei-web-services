#[macro_export]
macro_rules! partial_schema {
  (
    $partial_name:ident,
    $(#[$meta:meta])*
    $vis:vis struct $struct_name:ident {
      $(
        $(#[$field_meta:meta])*
        $field_vis:vis $field_name:ident : $field_type:ty
      ),*$(,)+
    }
  ) => {
    $(#[$meta])*
    $vis struct $struct_name {
      $(
        $(#[$field_meta])*
        $field_vis $field_name : $field_type
      ),*
    }

    $(#[$meta])*
    $vis struct $partial_name {
      $(
        $(#[$field_meta])*
        $field_vis $field_name : Option<$field_type>
      ),*
    }
  };
}

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
