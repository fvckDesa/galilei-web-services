use kube::Result;

mod galaxy;
mod planet;
mod star;
mod var;

pub use planet::PlanetRequestResolver;
pub use star::StarRequestResolver;
pub use var::VariableRequestResolver;

pub trait ResourceBind: Sized {
  type RequestResolver;

  async fn create(&self, api: Self::RequestResolver) -> Result<()>;

  async fn update(&self, api: Self::RequestResolver) -> Result<()>;

  async fn delete(&self, api: Self::RequestResolver) -> Result<()>;
}
