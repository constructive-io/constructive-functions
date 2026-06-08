.PHONY: install build clean lint generate dev dev-fn dev-down dev-logs docker-build skaffold-dev skaffold-dev-knative dev-compute setup-platform status verify-platform

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

# ═══════════════════════════════════════════════════════════════════════════════
# Tier 1 — pgpm-local
# ═══════════════════════════════════════════════════════════════════════════════
# Postgres only (via pgpm docker). Functions + services run as local Node
# processes. Fastest edit-run cycle.
#
# Quick start:
#   pgpm docker start --image docker.io/constructiveio/postgres-plus:18
#   eval "$(pgpm env)"
#   make setup-platform          # deploy infra + seed functions
#   make dev-compute             # start compute-service + functions

setup-platform:
	./scripts/setup-platform-db.sh

status:
	@./scripts/status.sh

verify-platform:
	@./scripts/verify-platform.sh $(DB_NAME)

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
