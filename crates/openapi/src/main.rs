use std::{fs, path::PathBuf};

use api::OpenApiSpec;
use clap::Parser;
use utoipa::OpenApi;

#[derive(Parser)]
struct Args {
  #[arg(short, long, default_value_t = false)]
  pretty: bool,
  #[arg(short, long)]
  output: Option<PathBuf>,
}

fn main() -> anyhow::Result<()> {
  let args = Args::parse();

  let spec = OpenApiSpec::openapi();

  let json = if args.pretty {
    spec.to_pretty_json()
  } else {
    spec.to_json()
  }?;

  if let Some(path) = args.output {
    fs::write(path, json)?;
  } else {
    println!("{}", json);
  }

  Ok(())
}
