use std::{fs, path::PathBuf};

use api::OpenApiSpec;
use clap::{Parser, ValueEnum};
use utoipa::OpenApi;

#[derive(Default, Clone, ValueEnum)]
enum OutputFormat {
  Json,
  #[default]
  Yaml,
}

#[derive(Parser)]
struct Args {
  #[arg(short, long)]
  output: Option<PathBuf>,
  #[arg(short, long, default_value_t, value_enum)]
  format: OutputFormat,
}

fn main() -> anyhow::Result<()> {
  let args = Args::parse();

  let spec = oas3::from_str(&OpenApiSpec::openapi().to_json()?)?;

  let output = match args.format {
    OutputFormat::Json => oas3::to_json(&spec),
    OutputFormat::Yaml => oas3::to_yaml(&spec),
  }?;

  if let Some(path) = args.output {
    fs::write(path, output)?;
  } else {
    println!("{}", output);
  }

  Ok(())
}
