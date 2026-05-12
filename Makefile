.PHONY: install build clean lint generate dev dev-fn dev-down dev-logs docker-build skaffold-dev skaffold-dev-knative

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

# --- Local development ---
# Infrastructure (postgres, db-setup, graphql-server, mailpit) runs in Docker.
# Functions run as local Node processes for fast edit-run cycles.

dev:
	docker compose up -d

dev-fn:
	node --experimental-strip-types scripts/dev.ts

dev-down:
	docker compose down

dev-logs:
	docker compose logs -f

# --- Setup ---
setup-dev:
	./scripts/setup-dev.sh

setup-check:
	./scripts/setup-dev.sh --check

# --- Skaffold k8s development ---
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
