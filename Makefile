.PHONY: install build clean lint generate register \
       up down status verify-platform check-env setup-platform \
       up\:email-job down\:email-job \
       up\:www \
       dev dev-fn dev-compute dev-down dev-logs setup-dev setup-check \
       secrets\:sync \
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
#   DROP=1 make down DB_NAME=mydb # also drop the database

up:
	./scripts/up.sh $(DB_NAME)

down:
	./scripts/down.sh $(DB_NAME)

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
