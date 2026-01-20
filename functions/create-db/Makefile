
IMAGE_NAME ?= constructive/pgpm-dump-test:v1
KIND_CLUSTER_NAME ?= interweb-local
KIND_BIN ?= $(shell which kind 2>/dev/null || echo "/opt/homebrew/bin/kind")

# Define Secrets and Env
TEST_PGHOST ?= postgres
TEST_PGPASSWORD ?= $(shell kubectl get secret --namespace default pg-credentials -o jsonpath="{.data.PGPASSWORD}" | base64 --decode)

.PHONY: vendor test clean test-k8s

test:
	pnpm test

clean:
	pnpm clean

# Test in K8s (In-Cluster)
# Test in K8s (In-Cluster)
test-k8s:
# Use centralized test runner
	cd ../.. && pnpm exec ts-node scripts/test-runner.ts --function create-db
