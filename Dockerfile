# Multi-stage build producing a slim, non-root server image for the Wasp app.
# Stages: base (runtime) -> wasp-builder (compile) -> deps (install/bundle) -> server (runtime).

# base: minimal runtime. openssl is required by Prisma's query engine.
FROM node:26-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
        openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production

# wasp-builder: runs `wasp build`, which emits a deployable app to /app/.wasp/out.
# NOTE: @latest can change the output layout between releases; pin a version if the build breaks.
FROM node:26-bookworm AS wasp-builder

RUN npm i -g @wasp.sh/wasp-cli@latest
ENV PATH="/root/.local/bin:${PATH}"

WORKDIR /app
COPY . .
RUN wasp build

# deps: installs dependencies and bundles the server.
# Wasp's output is an npm-workspaces monorepo whose server imports user code via
# relative paths, so we mirror its layout exactly: workspace-root files at /app,
# generated packages under /app/.wasp/out.
FROM node:26-bookworm AS deps

# Native toolchain for compiling node-gyp dependencies during npm install.
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential python3 libtool autoconf automake \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=wasp-builder /app/.wasp/out/package.json ./
COPY --from=wasp-builder /app/.wasp/out/package-lock.json ./
COPY --from=wasp-builder /app/.wasp/out/tsconfig*.json ./
COPY --from=wasp-builder /app/.wasp/out/src ./src
COPY --from=wasp-builder /app/.wasp/out/server ./.wasp/out/server
COPY --from=wasp-builder /app/.wasp/out/sdk ./.wasp/out/sdk
COPY --from=wasp-builder /app/.wasp/out/libs ./.wasp/out/libs
COPY --from=wasp-builder /app/.wasp/out/db ./.wasp/out/db

RUN npm install && cd .wasp/out/server && npm install
RUN cd .wasp/out/server && npx prisma generate --schema='../db/schema.prisma'
RUN cd .wasp/out/server && npm run bundle

# npm hoists workspace deps to the root, so the server may have no local
# node_modules. Create it so the runtime COPY below never fails.
RUN mkdir -p /app/.wasp/out/server/node_modules

# server: final runtime image. Runs as an unprivileged user.
FROM base AS server

# PUID/PGID let the image match host file ownership (handy for mounted volumes).
ARG PUID=1000
ARG PGID=1000

# Drop the stock `node` user and recreate `app` with the requested ids.
RUN userdel -r node 2>/dev/null || true; \
    groupadd -g "${PGID}" app; \
    useradd -u "${PUID}" -g "${PGID}" -m -s /usr/sbin/nologin app

WORKDIR /app

# Root node_modules holds Prisma, used to run migrations on startup.
COPY --from=deps --chown=app:app /app/node_modules ./node_modules
COPY --from=deps --chown=app:app /app/.wasp/out/server/node_modules ./.wasp/out/server/node_modules
COPY --from=deps --chown=app:app /app/.wasp/out/server/bundle ./.wasp/out/server/bundle
COPY --from=deps --chown=app:app /app/.wasp/out/server/package*.json ./.wasp/out/server/
COPY --from=deps --chown=app:app /app/.wasp/out/db ./.wasp/out/db

USER app
WORKDIR /app/.wasp/out/server

EXPOSE 3001
# start-production applies pending DB migrations, then starts the server.
CMD ["npm", "run", "start-production"]
