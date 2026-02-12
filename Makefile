.PHONY: build clean lint generate dev dev-build dev-down docker-build

build:
	pnpm run build

clean:
	pnpm run clean

lint:
	pnpm run lint

generate:
	pnpm run generate

dev-build:
	docker compose build

dev:
	docker compose up

dev-down:
	docker compose down

docker-build:
	pnpm run docker:build

# Build a single function image: make docker-build-send-email-link
docker-build-%:
	node --experimental-strip-types scripts/docker-build.ts --only=$*
