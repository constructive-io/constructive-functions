.PHONY: build clean lint generate dev dev-build dev-down

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
