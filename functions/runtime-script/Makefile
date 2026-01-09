.PHONY: test test-k8s

test:
	pnpm test

test-k8s:
	@echo "Running Generic Test Pattern for Runtime Script..."
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
	pnpm test -- functions/runtime-script/__tests__/index.test.ts || (echo "=== Proxy Logs ===" && cat proxy.log && kill $$PID && exit 1); \
	kill $$PID; \
	rm proxy.log
