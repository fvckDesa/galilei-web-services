ARG NODE_VERSION=20.16.0

FROM node:${NODE_VERSION}-alpine AS node-alpine
RUN apk update
RUN apk add --no-cache libc6-compat

FROM node-alpine AS node-rust
RUN apk add curl gcc musl-dev
COPY ./rust-toolchain.toml ./
ENV RUSTUP_HOME=/usr/local/rustup \
  CARGO_HOME=/usr/local/cargo \
  PATH=/usr/local/cargo/bin:$PATH \
  RUST_VERSION=1.81.0
RUN curl –proto ‘=https’ –tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path --profile minimal --default-toolchain $RUST_VERSION
RUN chmod -R a+w $RUSTUP_HOME $CARGO_HOME
RUN rustup --version; \
  cargo --version; \
  rustc --version;

FROM node-rust AS base
RUN npm install pnpm turbo --global
RUN pnpm config set store-dir ~/.pnpm-store

FROM base AS prune
WORKDIR /app
COPY . .
RUN turbo prune web --docker

FROM base AS build
WORKDIR /app
COPY ./Cargo.toml ./
COPY ./Cargo.lock ./
COPY ./.sqlx ./.sqlx
COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=prune /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=prune /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=prune /app/out/full/ .
RUN --mount=type=cache,id=cargo,target=/usr/local/cargo/registry \
  --mount=type=cache,id=rust,target=/app/target \
  SQLX_OFFLINE=true turbo build --filter=web
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm prune --prod --no-optional
RUN rm -rf ./**/*/src

FROM alpine
ARG PORT=80
ARG HOSTNAME="0.0.0.0"
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=build /app/apps/web/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static
USER nextjs
EXPOSE ${PORT}
ENV PORT=${PORT}
ENV HOSTNAME=${HOSTNAME}
CMD ["node", "server.js"]
