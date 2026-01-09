
.PHONY: test clean

test:
	pnpm test

clean:
	pnpm clean


KIND_BIN ?= $(shell which kind 2>/dev/null || echo "/opt/homebrew/bin/kind")

test-k8s:
# Build the test image (uses Dockerfile.test in root context)
	pnpm build:test-k8s:
	kubectl proxy --port=8001 > proxy.log 2>&1 & PID=$$!; \
	echo "Starting Proxy (PID: $$PID)..."; \
	sleep 2; \
	ENV_NAMES="PGHOST,PGPASSWORD,PGUSER" \
	TEST_PGPASSWORD=$$(kubectl get secret pg-credentials -o jsonpath="{.data.PGPASSWORD}" | base64 --decode) \
	IMAGE_NAME="constructive/function-test-runner:v1" \
	IS_IN_POD="false" \
	PGHOST=postgres \
	PGUSER=postgres \
	PGPASSWORD=$$TEST_PGPASSWORD \
	TEST_GRAPHQL_URL=$(TEST_GRAPHQL_URL) \
	pnpm test -- functions/simple-bash/__tests__/index.test.ts || (echo "=== Proxy Logs ===" && cat proxy.log && kill $$PID && exit 1); \
	kill $$PID; \
	rm proxy.log
