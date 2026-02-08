.PHONY: build clean lint test test-all build-test-runner docker-build docker-build-simple-email docker-build-send-email-link docker-push docker-push-simple-email docker-push-send-email-link

REGISTRY := ghcr.io/constructive-io/constructive-functions
# Detect kind binary (search PATH, fallback to Homebrew)
KIND_BIN := $(shell which kind)
ifeq ($(KIND_BIN),)
    KIND_BIN := /opt/homebrew/bin/kind
endif
KIND_CLUSTER_NAME ?= interweb-local

SUBDIRS := functions/simple-email functions/send-email-link

build:
	pnpm -r build

clean:
	pnpm -r clean

lint:
	pnpm -r lint

test:
	pnpm -r test

# Docker Build & Push (build from repo root for runner.js)
docker-build:
	$(MAKE) docker-build-send-email-link docker-build-simple-email

docker-build-simple-email:
	docker build -t $(REGISTRY)/simple-email:latest -f functions/simple-email/Dockerfile .

docker-build-send-email-link:
	docker build -t $(REGISTRY)/send-email-link:latest -f functions/send-email-link/Dockerfile .

docker-push:
	$(MAKE) docker-push-send-email-link docker-push-simple-email

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

# Individual Test Shortcuts (K8s)
test-email:
	pnpm exec ts-node scripts/test-runner.ts --function send-email-link

test-simple-email:
	pnpm exec ts-node scripts/test-runner.ts --function simple-email

# Cleanup K8s Resources
k8s-clean:
	@echo "Cleaning up K8s jobs for constructive-functions..."
	# Delete all jobs matching test-* or *-exec-* pattern (batch delete)
	@kubectl get jobs -n default --no-headers -o custom-columns=":metadata.name" | grep -E "^test-|-exec-" | xargs kubectl delete job -n default --ignore-not-found || true
	# Delete all pods matching test-* or *-exec-* pattern (orphaned pods) (batch delete)
	@kubectl get pods -n default --no-headers -o custom-columns=":metadata.name" | grep -E "^test-|-exec-" | xargs kubectl delete pod -n default --ignore-not-found || true
	@echo "Done."
