-- Add migration script here
CREATE TABLE IF NOT EXISTS users (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMP,
  user_id UUID NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS galaxies (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT galaxy_name_user UNIQUE (name, user_id) -- unique galaxy name for a user
);

CREATE TABLE IF NOT EXISTS stars (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nebula TEXT NOT NULL,
  public_domain TEXT UNIQUE,
  private_domain TEXT,
  port INT NOT NULL,
  galaxy_id UUID NOT NULL,
  FOREIGN KEY (galaxy_id) REFERENCES galaxies(id) ON DELETE CASCADE,
  CONSTRAINT star_name_galaxy UNIQUE (name, galaxy_id), -- unique star name inside a galaxy
  CONSTRAINT private_domain_galaxy UNIQUE (private_domain, galaxy_id) -- unique private domain name inside a galaxy
);

CREATE TABLE IF NOT EXISTS variables (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  star_id UUID NOT NULL,
  FOREIGN KEY (star_id) REFERENCES stars(id) ON DELETE CASCADE,
  CONSTRAINT var_name_star UNIQUE (name, star_id) -- unique variable name for a star
);

CREATE TABLE IF NOT EXISTS planets (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  capacity INT NOT NULL CHECK(capacity >= 0), -- unit size is MB
  path TEXT NOT NULL,
  star_id UUID, -- a planet may not have a star associated with it
  galaxy_id UUID NOT NULL,
  FOREIGN KEY (star_id) REFERENCES stars(id) ON DELETE SET NULL,
  FOREIGN KEY (galaxy_id) REFERENCES galaxies(id) ON DELETE CASCADE,
  CONSTRAINT planet_name_galaxy UNIQUE (name, galaxy_id), -- unique planet name inside a galaxy
  CONSTRAINT unique_planet_path_in_star UNIQUE (path, star_id) -- planet path is unique when connected to same star star
);