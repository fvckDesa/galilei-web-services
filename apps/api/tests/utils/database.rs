use api::schemas::{Project, Session, User};
use api::{AuthSecurity, Token};
use chrono::{Duration, NaiveDateTime, Utc};
use fake::faker::internet::en::{Password, Username};
use fake::faker::name::en::Name;
use fake::uuid::UUIDv4;
use fake::Fake;
use sqlx::PgPool;
use uuid::Uuid;

pub async fn insert_user(conn: &PgPool, user: &User) {
  let User {
    user_id,
    username,
    password,
  } = user;

  sqlx::query!(
    "INSERT INTO users(user_id, username, password) VALUES ($1, $2, $3)",
    user_id,
    username,
    api::Password::from(password.as_str()).hash().unwrap(),
  )
  .execute(conn)
  .await
  .unwrap();
}

pub async fn insert_random_user(conn: &PgPool) -> User {
  let user = User {
    user_id: UUIDv4.fake(),
    username: Username().fake(),
    password: Password(6..12).fake(),
  };

  insert_user(conn, &user).await;

  user
}

pub async fn insert_session(
  conn: &PgPool,
  expires: Option<NaiveDateTime>,
  user_id: &Uuid,
) -> Session {
  let session_id: Uuid = UUIDv4.fake();
  let token = Token::generate().unwrap();

  let mut session = sqlx::query_as!(
    Session,
    "INSERT INTO sessions(session_id, token, expires, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
    session_id,
    token.hash().unwrap(),
    expires,
    user_id
  )
  .fetch_one(conn)
  .await
  .unwrap();

  session.token = token.to_string();

  session
}

pub async fn insert_valid_session(conn: &PgPool, user_id: &Uuid) -> Session {
  insert_session(
    conn,
    Some(Utc::now().naive_utc() + Duration::hours(2)),
    user_id,
  )
  .await
}

pub async fn insert_project(conn: &PgPool, user_id: &Uuid) -> Project {
  let project_id: Uuid = UUIDv4.fake();
  let project_name: String = Name().fake();

  let project = sqlx::query_as!(
    Project,
    "INSERT INTO projects(project_id, project_name, user_id) VALUES ($1, $2, $3) RETURNING *",
    project_id,
    project_name,
    user_id
  )
  .fetch_one(conn)
  .await
  .unwrap();

  project
}
