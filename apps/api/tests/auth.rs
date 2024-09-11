mod utils;

use actix_web::{
  http::StatusCode,
  test::{self, TestRequest},
};
use api::{
  create_app,
  schemas::{AuthResponse, User},
  AuthSecurity, Password,
};
use fake::{uuid::UUIDv4, Fake};
use serde_json::json;
use utils::database;

#[sqlx::test(migrator = "api::MIGRATOR")]
async fn username_already_used(pool: sqlx::PgPool) {
  let user = database::insert_random_user(&pool).await;

  let app = test::init_service(create_app(pool)).await;

  let req = TestRequest::post()
    .uri("/auth/register")
    .set_json(json!({
      "username": user.username,
      "password": "password",
      "remember": false
    }))
    .to_request();

  let res = test::call_service(&app, req).await;

  assert_eq!(res.status(), StatusCode::CONFLICT)
}

#[sqlx::test(migrator = "api::MIGRATOR")]
async fn password_is_hashed(pool: sqlx::PgPool) {
  let app = test::init_service(create_app(pool.clone())).await;

  let password = Password::from("my-secure-password");

  let req = TestRequest::post()
    .uri("/auth/register")
    .set_json(json!({
      "username": "test",
      "password": *password,
      "remember": false
    }))
    .to_request();

  let res = test::call_service(&app, req).await;
  let body: AuthResponse = test::read_body_json(res).await;

  let row = sqlx::query!(
    "SELECT password FROM users WHERE user_id = $1",
    body.user.user_id
  )
  .fetch_one(&pool)
  .await
  .unwrap();

  assert!(password.verify(&row.password).is_ok())
}

#[sqlx::test(migrator = "api::MIGRATOR")]
async fn token_is_hashed_in_registration(pool: sqlx::PgPool) {
  let app = test::init_service(create_app(pool.clone())).await;

  let req = TestRequest::post()
    .uri("/auth/register")
    .set_json(json!({
      "username": "test",
      "password": "password",
      "remember": false
    }))
    .to_request();

  let res = test::call_service(&app, req).await;
  let body: AuthResponse = test::read_body_json(res).await;

  let row = sqlx::query!(
    "SELECT token FROM sessions WHERE user_id = $1",
    body.user.user_id
  )
  .fetch_one(&pool)
  .await
  .unwrap();

  assert!(body.token.verify(&row.token).is_ok())
}

#[sqlx::test(migrator = "api::MIGRATOR")]
async fn register_with_temporary_session(pool: sqlx::PgPool) {
  let app = test::init_service(create_app(pool)).await;

  let req = TestRequest::post()
    .uri("/auth/register")
    .set_json(json!({
      "username": "test",
      "password": "password",
      "remember": false
    }))
    .to_request();

  let res = test::call_service(&app, req).await;
  let body: AuthResponse = test::read_body_json(res).await;

  assert!(body.expires.is_some())
}

#[sqlx::test(migrator = "api::MIGRATOR")]
async fn register_with_permanent_session(pool: sqlx::PgPool) {
  let app = test::init_service(create_app(pool)).await;

  let req = TestRequest::post()
    .uri("/auth/register")
    .set_json(json!({
      "username": "test",
      "password": "password",
      "remember": true
    }))
    .to_request();

  let res = test::call_service(&app, req).await;
  let body: AuthResponse = test::read_body_json(res).await;

  assert!(body.expires.is_none())
}

#[sqlx::test(migrator = "api::MIGRATOR")]
async fn login_wrong_password(pool: sqlx::PgPool) {
  database::insert_user(
    &pool,
    &User {
      user_id: UUIDv4.fake(),
      username: "foo".to_string(),
      password: "bar".to_string(),
    },
  )
  .await;

  let app = test::init_service(create_app(pool)).await;

  let req = TestRequest::post()
    .uri("/auth/login")
    .set_json(json!({
      "username": "foo",
      "password": "barr",
      "remember": false
    }))
    .to_request();

  let res = test::call_service(&app, req).await;

  assert_eq!(res.status(), StatusCode::UNAUTHORIZED)
}

#[sqlx::test(migrator = "api::MIGRATOR")]
async fn login_wrong_username(pool: sqlx::PgPool) {
  database::insert_user(
    &pool,
    &User {
      user_id: UUIDv4.fake(),
      username: "foo".to_string(),
      password: "bar".to_string(),
    },
  )
  .await;

  let app = test::init_service(create_app(pool)).await;

  let req = TestRequest::post()
    .uri("/auth/login")
    .set_json(json!({
      "username": "my_user",
      "password": "bar",
      "remember": false
    }))
    .to_request();

  let res = test::call_service(&app, req).await;

  assert_eq!(res.status(), StatusCode::UNAUTHORIZED)
}

#[sqlx::test(migrator = "api::MIGRATOR")]
async fn token_is_hashed_in_login(pool: sqlx::PgPool) {
  let user = database::insert_random_user(&pool).await;

  let app = test::init_service(create_app(pool.clone())).await;

  let req = TestRequest::post()
    .uri("/auth/login")
    .set_json(json!({
      "username": user.username,
      "password": user.password,
      "remember": false
    }))
    .to_request();

  let res = test::call_service(&app, req).await;
  let body: AuthResponse = test::read_body_json(res).await;

  let row = sqlx::query!(
    "SELECT token FROM sessions WHERE user_id = $1",
    body.user.user_id
  )
  .fetch_one(&pool)
  .await
  .unwrap();

  assert!(body.token.verify(&row.token).is_ok())
}

#[sqlx::test(migrator = "api::MIGRATOR")]
async fn successfully_login(pool: sqlx::PgPool) {
  let user = database::insert_random_user(&pool).await;

  let app = test::init_service(create_app(pool.clone())).await;

  let req = TestRequest::post()
    .uri("/auth/login")
    .set_json(json!({
      "username": user.username,
      "password": user.password,
      "remember": false
    }))
    .to_request();

  let res = test::call_service(&app, req).await;

  assert!(res.status().is_success())
}
