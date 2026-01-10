.PHONY: build clean lint test test-all build-test-runner docker-build docker-build-simple-email docker-build-send-email-link docker-push docker-push-simple-email docker-push-send-email-link

REGISTRY := ghcr.io/constructive-io/constructive-functions
KIND_BIN ?= /opt/homebrew/bin/kind

SUBDIRS := functions/hello-world functions/simple-email functions/send-email-link functions/runtime-script

build:
	pnpm -r build

clean:
	pnpm -r clean

lint:
	pnpm -r lint

test:
	pnpm -r test

# Docker Build & Push (Restored)
docker-build:
	@echo "Building Docker images for functions..."
	@for fn in functions/*; do \
		if [ -f "$$fn/Dockerfile" ]; then \
			echo "Building $$fn..."; \
			docker build -t "$(REGISTRY)/$$(basename $$fn):latest" "$$fn"; \
		fi \
	done

docker-build-simple-email:
	docker build -t $(REGISTRY)/simple-email:latest functions/simple-email

docker-build-send-email-link:
	docker build -t $(REGISTRY)/send-email-link:latest functions/send-email-link

docker-push:
	@echo "Pushing Docker images to $(REGISTRY)..."
	@for fn in functions/*; do \
		if [ -f "$$fn/Dockerfile" ]; then \
			echo "Pushing $$fn..."; \
			docker push "$(REGISTRY)/$$(basename $$fn):latest"; \
		fi \
	done

docker-push-simple-email:
	docker push $(REGISTRY)/simple-email:latest

docker-push-send-email-link:
	docker push $(REGISTRY)/send-email-link:latest

# Kubernetes Test Runner
test-k8s-all: build-test-runner
	@echo "Running All K8s Tests (Centralized Runner)..."
	# Run the centralized TS test runner
	npx ts-node scripts/test-runner.ts

build-test-runner:
	@echo "Building Shared Test Runner Image..."
	docker build -f functions/_runtimes/node/Dockerfile.test -t constructive/function-test-runner:v2 .
	$(KIND_BIN) load docker-image constructive/function-test-runner:v2 --name interweb-local
