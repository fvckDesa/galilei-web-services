#!/usr/bin/env bash

set -e # automatic exit on cmd fail

BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # no color

blueEcho () {
  echo -e "${BLUE}$1${NC}"
}

checkDependecy () {
  if [[ -z $(command -v "$1") ]]; then
    >&2 echo -e "${RED}Error:${NC} missing dependecy ${BLUE}$1${NC}"
    exit 1
  fi
}

checkDependecy pnpm
checkDependecy cargo

blueEcho "Installing cargo-watch..."
cargo install cargo-watch
echo

blueEcho "Installing sqlx-cli..."
cargo install sqlx-cli
echo

blueEcho "Installing pnpm dependecies..."
pnpm i
echo

blueEcho "Installing rust dependecies..."
cargo build
echo

chmod +x scripts/*
chmod -x scripts/utils.ts

blueEcho "Generating env files..."
scripts/gen-env.ts
echo