.PHONY: build clean lint test test-all build-test-runner docker-build docker-build-simple-email docker-build-send-email-link docker-push docker-push-simple-email docker-push-send-email-link

REGISTRY := ghcr.io/constructive-io/constructive-functions
# Detect kind binary (search PATH, fallback to Homebrew)
KIND_BIN := $(shell which kind)
ifeq ($(KIND_BIN),)
    KIND_BIN := /opt/homebrew/bin/kind
endif
KIND_CLUSTER_NAME ?= interweb-local

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
# Run All Tests inside K8s (Centralized Runner)
test-k8s-all:
	@echo "Running all K8s tests via centralized KubernetesJS runner..."
	pnpm exec ts-node scripts/test-runner.ts

build-test-runner:
	@echo "Building Shared Test Runner Image..."
	docker build -f functions/_runtimes/node/Dockerfile.test -t constructive/function-test-runner:v4 .
	$(KIND_BIN) load docker-image constructive/function-test-runner:v4 --name $(KIND_CLUSTER_NAME)

# Individual Test Shortcuts
test-calvin:
	pnpm exec ts-node scripts/test-runner.ts --function llm-internal-calvin

test-opencode-headless:
	pnpm exec ts-node scripts/test-runner.ts --function opencode-headless

test-twilio:
	pnpm exec ts-node scripts/test-runner.ts --function twilio-sms

test-llm-external:
	pnpm exec ts-node scripts/test-runner.ts --function llm-external

test-email:
	pnpm exec ts-node scripts/test-runner.ts --function send-email-link

# Cleanup K8s Resources
k8s-clean:
	@echo "Cleaning up K8s jobs for constructive-functions..."
	# Delete all jobs matching test-* or *-exec-* pattern (batch delete)
	@kubectl get jobs -n default --no-headers -o custom-columns=":metadata.name" | grep -E "^test-|-exec-" | xargs kubectl delete job -n default --ignore-not-found || true
	# Delete all pods matching test-* or *-exec-* pattern (orphaned pods) (batch delete)
	@kubectl get pods -n default --no-headers -o custom-columns=":metadata.name" | grep -E "^test-|-exec-" | xargs kubectl delete pod -n default --ignore-not-found || true
	@echo "Done."
