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
docker-build-runtime:
	@echo "Building Shared Node Runtime..."
	docker build -t constructive/node-runtime:latest functions/_runtimes/node -f functions/_runtimes/node/Dockerfile.runtime

docker-build: docker-build-runtime

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

# Generic target to run specific function test (e.g., make test-k8s-hello-world)
test-k8s-%:
	@echo "Running K8s test for function: $*"
	pnpm exec ts-node scripts/test-runner.ts --function $*

build-test-runner:
	@echo "Building Shared Test Runner Image..."
	docker build -f functions/_runtimes/node/Dockerfile.test -t constructive/function-test-runner:v9 .
	$(KIND_BIN) load docker-image constructive/function-test-runner:v9 --name $(KIND_CLUSTER_NAME)

rebuild-all-runners: build-test-runner
	@echo "All runners rebuilt and loaded into Kind."

# Individual Test Shortcuts
test-k8s-create-db:
	pnpm exec ts-node scripts/test-runner.ts --function create-db

test-k8s-crypto-login:
	pnpm exec ts-node scripts/test-runner.ts --function crypto-login

test-k8s-github-repo-creator:
	pnpm exec ts-node scripts/test-runner.ts --function github-repo-creator

test-k8s-hello-world:
	pnpm exec ts-node scripts/test-runner.ts --function hello-world

test-k8s-llm-external:
	pnpm exec ts-node scripts/test-runner.ts --function llm-external

test-k8s-llm-internal-calvin:
	pnpm exec ts-node scripts/test-runner.ts --function llm-internal-calvin

test-k8s-opencode-headless:
	pnpm exec ts-node scripts/test-runner.ts --function opencode-headless

test-k8s-pgpm-dump:
	pnpm exec ts-node scripts/test-runner.ts --function pgpm-dump

test-k8s-runtime-script:
	pnpm exec ts-node scripts/test-runner.ts --function runtime-script

test-k8s-send-email-link:
	pnpm exec ts-node scripts/test-runner.ts --function send-email-link

test-k8s-simple-bash:
	pnpm exec ts-node scripts/test-runner.ts --function simple-bash

test-k8s-simple-email:
	pnpm exec ts-node scripts/test-runner.ts --function simple-email

test-k8s-stripe-function:
	pnpm exec ts-node scripts/test-runner.ts --function stripe-function

test-k8s-twilio-sms:
	pnpm exec ts-node scripts/test-runner.ts --function twilio-sms

test-k8s-pytorch-gpu:
	docker build -t constructive/pytorch-gpu:latest functions/pytorch-gpu
	$(KIND_BIN) load docker-image constructive/pytorch-gpu:latest --name $(KIND_CLUSTER_NAME)
	pnpm exec ts-node scripts/test-runner.ts --function pytorch-gpu

test-k8s-rust-hello-world:
	docker build -t constructive/rust-hello-world:latest functions/rust-hello-world
	$(KIND_BIN) load docker-image constructive/rust-hello-world:latest --name $(KIND_CLUSTER_NAME)
	pnpm exec ts-node scripts/test-runner.ts --function rust-hello-world

# Cleanup K8s Resources
k8s-clean:
	@echo "Cleaning up K8s jobs for constructive-functions..."
	# Delete all jobs matching test-* or *-exec-* pattern (batch delete)
	@kubectl get jobs -n default --no-headers -o custom-columns=":metadata.name" | grep -E "^test-|-exec-" | xargs kubectl delete job -n default --ignore-not-found || true
	# Delete all pods matching test-* or *-exec-* pattern (orphaned pods) (batch delete)
	@kubectl get pods -n default --no-headers -o custom-columns=":metadata.name" | grep -E "^test-|-exec-" | xargs kubectl delete pod -n default --ignore-not-found || true
	@echo "Done."
