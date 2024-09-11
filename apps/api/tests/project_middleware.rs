use actix_web::{
  http::StatusCode,
  test::{self, TestRequest},
};
use api::{create_app, API_KEY};

mod utils;

use utils::database;

#[sqlx::test(migrator = "api::MIGRATOR")]
async fn user_is_not_the_owner(pool: sqlx::PgPool) {
  let user1 = database::insert_random_user(&pool).await;
  let user2 = database::insert_random_user(&pool).await;
  let session = database::insert_valid_session(&pool, &user2.user_id).await;
  let project = database::insert_project(&pool, &user1.user_id).await;

  let app = test::init_service(create_app(pool)).await;

  let req = TestRequest::get()
    .uri(&format!("/projects/{}", project.project_id))
    .append_header((API_KEY, session.token))
    .to_request();

  let res = test::try_call_service(&app, req).await;

  assert_eq!(
    res.err().unwrap().error_response().status(),
    StatusCode::NOT_FOUND
  )
}

#[sqlx::test(migrator = "api::MIGRATOR")]
async fn user_is_the_owner(pool: sqlx::PgPool) {
  let user = database::insert_random_user(&pool).await;
  let session = database::insert_valid_session(&pool, &user.user_id).await;
  let project = database::insert_project(&pool, &user.user_id).await;

  let app = test::init_service(create_app(pool)).await;

  let req = TestRequest::get()
    .uri(&format!("/projects/{}", project.project_id))
    .append_header((API_KEY, session.token))
    .to_request();

  println!("{}", req.path());

  let res = test::call_service(&app, req).await;

  assert!(res.status().is_success())
}
