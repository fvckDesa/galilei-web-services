-- Add migration script here
CREATE TABLE
  IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    token TEXT NOT NULL UNIQUE,
    expires TIMESTAMP,
    user_id UUID NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
  );

CREATE TABLE
  IF NOT EXISTS projects (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    project_name TEXT NOT NULL,
    user_id UUID NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT unique_project_name_for_user UNIQUE (project_name, user_id)
  );

CREATE TABLE
  IF NOT EXISTS app_services (
    app_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    app_name TEXT NOT NULL,
    replicas INT NOT NULL,
    image TEXT NOT NULL,
    port INT NOT NULL,
    public_domain TEXT UNIQUE,
    private_domain TEXT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    project_id UUID NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects (project_id) ON DELETE CASCADE,
    CONSTRAINT unique_app_name_for_project UNIQUE (app_name, project_id),
    CONSTRAINT unique_private_domain_for_project UNIQUE (private_domain, project_id)
  );

CREATE TABLE
  IF NOT EXISTS envs (
    env_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    env_name TEXT NOT NULL,
    env_value TEXT NOT NULL,
    app_id UUID NOT NULL,
    FOREIGN KEY (app_id) REFERENCES app_services (app_id) ON DELETE CASCADE,
    CONSTRAINT unique_env_name_for_app UNIQUE (env_name, app_id)
  );

CREATE TABLE
  IF NOT EXISTS volumes (
    volume_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    volume_name TEXT NOT NULL,
    capacity INT NOT NULL CHECK (capacity >= 0), -- unit size is MB
    path TEXT NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    app_id UUID UNIQUE, -- a volume may not have an app associated with it and an app can only have one volume
    project_id UUID NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects (project_id) ON DELETE CASCADE,
    FOREIGN KEY (app_id) REFERENCES app_services (app_id) ON DELETE SET NULL,
    CONSTRAINT unique_volume_name_for_project UNIQUE (volume_name, project_id)
  );