.PHONY: install build clean lint generate dev dev-fn dev-down dev-logs docker-build

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

# --- Docker image builds ---

docker-build:
	pnpm run docker:build

# Build a single function image: make docker-build-send-email-link
docker-build-%:
	node --experimental-strip-types scripts/docker-build.ts --only=$*
