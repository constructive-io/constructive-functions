#!/bin/bash
set -e

# Resolve function name from directory path (parent of parent of current script)
FUNCTION_NAME=$(basename $(dirname $(dirname $(realpath $0))))
SCRIPT_DIR=$(dirname $(realpath $0))
ROOT_DIR=$(dirname $(dirname $(dirname $(dirname $SCRIPT_DIR))))

echo "[K8s-Runner] Executing test for function: $FUNCTION_NAME"
echo "[K8s-Runner] Root Dir: $ROOT_DIR"

# Invoke the centralized test runner with the specific function argument
pnpm exec ts-node "$ROOT_DIR/scripts/test-runner.ts" --function "$FUNCTION_NAME"
