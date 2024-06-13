use async_trait::async_trait;
use derive_more::From;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};
use uuid::Uuid;
use validator::Validate;

use crate::{
  database::{Connection, DbResult},
  gen_update_data,
};

use super::{star::StarPath, CrudOperations};

#[derive(Debug, Serialize, ToSchema)]
pub struct Variable {
  pub id: Uuid,
  #[schema(min_length = 1)]
  pub name: String,
  #[schema(min_length = 1)]
  pub value: String,
  pub star_id: Uuid,
}

gen_update_data! {
  UpdateVariableData,
  #[derive(Debug, Deserialize, Validate, ToSchema)]
  pub struct CreateVariableData {
    #[schema(min_length = 1)]
    #[validate(length(min = 1, message = "cannot be empty"))]
    name: String,
    #[schema(min_length = 1)]
    #[validate(length(min = 1, message = "cannot be empty"))]
    value: String,
  }
}

#[derive(Debug, From, Deserialize, IntoParams)]
#[into_params(names("galaxy_id", "star_id", "variable_id"), parameter_in = Path)]
pub struct VariablePath(pub Uuid, pub Uuid, pub Uuid);

#[async_trait]
impl CrudOperations for Variable {
  type OwnerIdent = StarPath;
  type ResourceIdent = VariablePath;
  type CreateData = CreateVariableData;
  type UpdateData = UpdateVariableData;

  async fn all(conn: &mut Connection, ident: &Self::OwnerIdent) -> DbResult<Vec<Self>> {
    let StarPath(_, star_id) = ident;

    let vars = sqlx::query_as!(
      Variable,
      "SELECT * FROM variables WHERE star_id = $1",
      star_id
    )
    .fetch_all(conn)
    .await?;

    Ok(vars)
  }

  async fn get(conn: &mut Connection, ident: &Self::ResourceIdent) -> DbResult<Self> {
    let VariablePath(_, star_id, var_id) = ident;

    let var = sqlx::query_as!(
      Variable,
      "SELECT * FROM variables WHERE star_id = $1 AND id = $2",
      star_id,
      var_id
    )
    .fetch_one(conn)
    .await?;

    Ok(var)
  }

  async fn create(
    conn: &mut Connection,
    ident: &Self::OwnerIdent,
    data: &Self::CreateData,
  ) -> DbResult<Self> {
    let StarPath(_, star_id) = ident;
    let CreateVariableData { name, value } = data;

    let var = sqlx::query_as!(
      Variable,
      "INSERT INTO variables(name, value, star_id) VALUES ($1, $2, $3) RETURNING *",
      name,
      value,
      star_id
    )
    .fetch_one(conn)
    .await?;

    Ok(var)
  }

  async fn update(
    conn: &mut Connection,
    ident: &Self::ResourceIdent,
    data: &Self::UpdateData,
  ) -> DbResult<Self> {
    let VariablePath(_, star_id, var_id) = ident;
    let UpdateVariableData { name, value } = data;

    let new_var = sqlx::query_as!(
      Variable,
      r#"UPDATE variables
      SET name = COALESCE($1, name), value = COALESCE($2, value)
      WHERE star_id = $3 AND id = $4
      RETURNING *"#,
      name.as_deref(),
      value.as_deref(),
      star_id,
      var_id
    )
    .fetch_one(conn)
    .await?;

    Ok(new_var)
  }

  async fn delete(conn: &mut Connection, ident: &Self::ResourceIdent) -> DbResult<Self> {
    let VariablePath(_, star_id, var_id) = ident;

    let deleted_star = sqlx::query_as!(
      Variable,
      "DELETE FROM variables WHERE star_id = $1 AND id = $2 RETURNING *",
      star_id,
      var_id
    )
    .fetch_one(conn)
    .await?;

    Ok(deleted_star)
  }
}
