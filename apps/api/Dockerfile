# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/reference/dockerfile/

################################################################################
# Create a stage for building the application.

ARG RUST_VERSION=1.79.0
ARG APP_NAME=api

FROM rust:${RUST_VERSION}-slim-bullseye AS build
ARG APP_NAME
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=cargo,target=/usr/local/cargo/registry \
  SQLX_OFFLINE=true cargo build -p api --locked --release
RUN cp ./target/release/$APP_NAME /bin/server

FROM debian:bullseye-slim AS final
ARG UID=10001
RUN adduser \
  --disabled-password \
  --gecos "" \
  --home "/nonexistent" \
  --shell "/sbin/nologin" \
  --no-create-home \
  --uid "${UID}" \
  appuser
USER appuser
COPY --from=build /bin/server /bin/
EXPOSE 80
CMD ["/bin/server"]