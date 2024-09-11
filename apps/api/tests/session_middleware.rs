use actix_web::{
  http::StatusCode,
  test::{self, TestRequest},
};
use api::{create_app, Token, API_KEY};
use chrono::{Duration, Utc};

mod utils;

use utils::database;

#[sqlx::test(migrator = "api::MIGRATOR")]
async fn missing_api_key(pool: sqlx::PgPool) {
  let app = test::init_service(create_app(pool)).await;

  let req = TestRequest::get().uri("/projects").to_request();

  let res = test::try_call_service(&app, req).await;

  assert_eq!(
    res.err().unwrap().error_response().status(),
    StatusCode::UNAUTHORIZED
  )
}

#[sqlx::test(migrator = "api::MIGRATOR")]
async fn invalid_api_key_format(pool: sqlx::PgPool) {
  let app = test::init_service(create_app(pool)).await;

  let req = TestRequest::get()
    .uri("/projects")
    .append_header((API_KEY, "a23062c67ec031d794e9"))
    .to_request();

  let res = test::try_call_service(&app, req).await;

  assert_eq!(
    res.err().unwrap().error_response().status(),
    StatusCode::UNAUTHORIZED
  )
}

#[sqlx::test(migrator = "api::MIGRATOR")]
async fn api_key_not_found(pool: sqlx::PgPool) {
  let user = database::insert_random_user(&pool).await;
  let _ = database::insert_valid_session(&pool, &user.user_id).await;

  let app = test::init_service(create_app(pool)).await;

  let req = TestRequest::get()
    .uri("/projects")
    .append_header((API_KEY, Token::generate().unwrap().to_string()))
    .to_request();

  let res = test::try_call_service(&app, req).await;

  assert_eq!(
    res.err().unwrap().error_response().status(),
    StatusCode::UNAUTHORIZED
  )
}

#[sqlx::test(migrator = "api::MIGRATOR")]
async fn session_is_expired(pool: sqlx::PgPool) {
  let user = database::insert_random_user(&pool).await;
  let session = database::insert_session(
    &pool,
    Some(Utc::now().naive_utc() - Duration::hours(1)),
    &user.user_id,
  )
  .await;

  let app = test::init_service(create_app(pool)).await;

  let req = TestRequest::get()
    .uri("/projects")
    .append_header((API_KEY, session.token))
    .to_request();

  let res = test::try_call_service(&app, req).await;

  assert_eq!(
    res.err().unwrap().error_response().status(),
    StatusCode::UNAUTHORIZED
  )
}

#[sqlx::test(migrator = "api::MIGRATOR")]
async fn session_found(pool: sqlx::PgPool) {
  let user = database::insert_random_user(&pool).await;
  let session = database::insert_valid_session(&pool, &user.user_id).await;

  let app = test::init_service(create_app(pool)).await;

  let req = TestRequest::get()
    .uri("/projects")
    .append_header((API_KEY, session.token))
    .to_request();

  let res = test::call_service(&app, req).await;

  assert!(res.status().is_success())
}

#[sqlx::test(migrator = "api::MIGRATOR")]
async fn permanent_session_found(pool: sqlx::PgPool) {
  let user = database::insert_random_user(&pool).await;
  let session = database::insert_session(&pool, None, &user.user_id).await;

  let app = test::init_service(create_app(pool)).await;

  let req = TestRequest::get()
    .uri("/projects")
    .append_header((API_KEY, session.token))
    .to_request();

  let res = test::call_service(&app, req).await;

  assert!(res.status().is_success())
}
