use actix_web::{
  body::MessageBody,
  dev::{ServiceRequest, ServiceResponse},
  middleware::Next,
  web::{Path, ReqData},
};

use crate::{database::Pool, schemas::ProjectPath, ApiError};

use super::UserId;

pub async fn project_middleware(
  mut req: ServiceRequest,
  next: Next<impl MessageBody>,
) -> Result<ServiceResponse<impl MessageBody>, actix_web::Error> {
  let user_id = req.extract::<ReqData<UserId>>().await?.into_inner();
  let project_id = req.extract::<Path<ProjectPath>>().await?.project_id;
  let pool = req.app_data::<Pool>().expect("Pool not found");

  let _ = sqlx::query!(
    "SELECT 1 as ok FROM projects WHERE project_id = $1 AND user_id = $2",
    project_id,
    *user_id
  )
  .fetch_one(pool.as_ref())
  .await
  .map_err(ApiError::from)?;

  next.call(req).await
}
