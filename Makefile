.PHONY: install build clean lint generate register register\:apply \
       up down kill status verify-platform check-env setup-platform \
       up\:email-job down\:email-job \
       up\:www \
       generate\:schemas generate\:sdk generate\:cli generate\:hooks generate\:sdk-all \
       dev dev-fn dev-compute dev-down dev-logs setup-dev setup-check \
       secrets\:sync \
       test test\:unit test\:integration test\:workflow test\:workflow\:schema test\:functions \
       skaffold-dev skaffold-dev-knative docker-build

install:
	node --experimental-strip-types scripts/generate.ts
	pnpm install

build:
	pnpm run build

clean:
	pnpm run clean

lint:
	pnpm run lint

generate:
	pnpm run generate

register:
	node --experimental-strip-types scripts/register-functions.ts

register\:apply:
	node --experimental-strip-types scripts/register-functions.ts --apply

# ═══════════════════════════════════════════════════════════════════════════════
# Lifecycle — up / down
# ═══════════════════════════════════════════════════════════════════════════════
#
# Full procedural setup and teardown. Idempotent — safe to run repeatedly.
#
#   make up                       # postgres + deploy infra + seed + verify
#   make up DB_NAME=mydb          # same, custom DB name
#   make up:email-job             # add mailpit + compute-service (SMTP mode)
#   make down:email-job           # stop mailpit + compute-service
#   make down                     # stop everything (postgres, compose, etc.)
#   make kill                     # make down + drop all constructive-functions databases
#   DROP=1 make down DB_NAME=mydb # also drop the database
#
# SDK generation (requires GraphQL server running — do make up first):
#   make generate:schemas          # export .graphql from live endpoints
#   make generate:sdk              # ORM client from schema files
#   make generate:cli              # CLI from schema files
#   make generate:hooks            # React Query hooks from schema files
#   make generate:sdk-all          # all of the above in order

up:
	./scripts/up.sh $(DB_NAME)

down:
	./scripts/down.sh $(DB_NAME)

kill:
	pgpm kill --pattern constructive-functions% --yes
	./scripts/down.sh $(DB_NAME)

# ═══════════════════════════════════════════════════════════════════════════════
# SDK generation — schemas, ORM, CLI, hooks
# ═══════════════════════════════════════════════════════════════════════════════

generate\:schemas:
	pnpm run generate:schemas

generate\:sdk:
	pnpm run generate:sdk

generate\:cli:
	pnpm run generate:cli

generate\:hooks:
	pnpm run generate:hooks

generate\:sdk-all:
	pnpm run generate:sdk-all

up\:email-job:
	./scripts/email-job-up.sh $(DB_NAME)

down\:email-job:
	./scripts/email-job-down.sh

up\:www:
	./scripts/www-up.sh $(DB_NAME)

# ═══════════════════════════════════════════════════════════════════════════════
# Tier 1 — pgpm-local
# ═══════════════════════════════════════════════════════════════════════════════
# Postgres only (via pgpm docker). Functions + services run as local Node
# processes. Fastest edit-run cycle.
#
# Quick start:
#   make up                      # full setup
#   make up:email-job            # start mailpit + compute-service

setup-platform:
	./scripts/setup-platform-db.sh

status:
	@./scripts/status.sh

verify-platform:
	@./scripts/verify-platform.sh $(DB_NAME)

check-env:
	@./scripts/load-platform-env.sh $(ENV_FILE) $(DB_NAME)

# ═══════════════════════════════════════════════════════════════════════════════
# Tier 2 — compose-local
# ═══════════════════════════════════════════════════════════════════════════════
# Infrastructure (postgres, db-setup, graphql-server, mailpit) runs in Docker.
# Functions run as local Node processes for fast edit-run cycles.
#
# Quick start:
#   make dev                     # docker compose up -d
#   make dev-fn                  # start existing job-service + functions
#   make dev-compute             # or start compute-service + functions

dev:
	docker compose up -d

dev-fn:
	node --experimental-strip-types scripts/dev.ts

dev-compute:
	node --experimental-strip-types scripts/dev-compute.ts

dev-down:
	docker compose down

dev-logs:
	docker compose logs -f

# --- Setup ---
setup-dev:
	./scripts/setup-dev.sh

setup-check:
	./scripts/setup-dev.sh --check

secrets\:sync:
	./scripts/secrets-sync.sh $(ENV_FILE) $(DB_NAME)

# ═══════════════════════════════════════════════════════════════════════════════
# Tier 3 — k8s-local
# ═══════════════════════════════════════════════════════════════════════════════
# Everything runs in a local Kubernetes cluster via Skaffold.
#
# Quick start:
#   make skaffold-dev            # plain k8s (no Knative needed)
#   make skaffold-dev-knative    # full Knative setup

# Plain k8s (Deployments + Services, no Knative operators needed)
skaffold-dev:
	skaffold dev -p local-simple

# ═══════════════════════════════════════════════════════════════════════════════
# Testing
# ═══════════════════════════════════════════════════════════════════════════════
#
# Workflow tests run against a live `make up` stack (pgpm-local PostgreSQL).
# Schema tests only need `make up`. Full workflow tests also need `make dev-compute`.
#
#   make test:workflow:schema     # verify DB schema, tables, registrations
#   make test:workflow            # full pipeline: dispatch → log → rollup → GraphQL
#   make test:unit                # unit tests (functions/*/__tests__)
#   make test:integration         # integration tests (tests/integration/)

test:
	pnpm test

test\:unit:
	pnpm test:unit

test\:integration:
	pnpm test:integration

test\:workflow:
	pnpm test:workflow

test\:workflow\:schema:
	pnpm test:workflow:schema

test\:functions:
	pnpm --filter @constructive-io/functions-test test

# Single function: make skaffold-dev-send-email
skaffold-dev-%:
	skaffold dev -p $*

# Full Knative setup (requires: cd k8s && make operators-knative-only)
skaffold-dev-knative:
	skaffold dev -p local

# --- Docker image builds ---

docker-build:
	pnpm run docker:build

# Build a single function image: make docker-build-send-verification-link
docker-build-%:
	node --experimental-strip-types scripts/docker-build.ts --only=$*
