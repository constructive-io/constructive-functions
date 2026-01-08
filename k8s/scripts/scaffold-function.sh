#!/bin/bash
set -e

FUNCTION_NAME=""
TEMPLATE="node"

while [[ $# -gt 0 ]]; do
  case $1 in
    --template=*)
      TEMPLATE="${1#*=}"
      shift
      ;;
    *)
      FUNCTION_NAME="$1"
      shift
      ;;
  esac
done

if [ -z "$FUNCTION_NAME" ]; then
  echo "Error: FUNCTION_NAME is required."
  echo "Usage: $0 <function-name> [--template=node|bash]"
  exit 1
fi

BASE_DIR=$(dirname "$0")/../base/functions

if [ "$TEMPLATE" == "bash" ]; then
    TEMPLATE_FILE="$BASE_DIR/simple-bash.yaml"
    SOURCE_TEMPLATE_DIR="$BASE_DIR/../../functions/simple-bash"
    echo "Using BASH template..."
else
    TEMPLATE_FILE="$BASE_DIR/hello-world.yaml"
    SOURCE_TEMPLATE_DIR="$BASE_DIR/../../functions/hello-world"
    echo "Using NODE template..."
fi

if [ -f "$TARGET_FILE" ]; then
  echo "Error: Function '$FUNCTION_NAME' already exists at $TARGET_FILE"
  exit 1
fi

if [ ! -f "$TEMPLATE_FILE" ]; then
  echo "Error: Template file '$TEMPLATE_FILE' not found."
  exit 1
fi


# ... existing YAML scaffolding ...
echo "Scaffolding function '$FUNCTION_NAME'..."
cp "$TEMPLATE_FILE" "$TARGET_FILE"

# Replace hello-world with the new function name in the new file
sed -i.bak "s/hello-world/$FUNCTION_NAME/g" "$TARGET_FILE"
rm "$TARGET_FILE.bak"

echo "K8s manifest created at $TARGET_FILE"

# --- Source Code Scaffolding ---


# SOURCE_TEMPLATE_DIR is set above based on template

SOURCE_TARGET_DIR="$BASE_DIR/../../functions/$FUNCTION_NAME"

if [ -d "$SOURCE_TARGET_DIR" ]; then
  echo "Error: Source directory '$SOURCE_TARGET_DIR' already exists."
  exit 1
fi

echo "Scaffolding source code to '$SOURCE_TARGET_DIR'..."
# Copy recursively
cp -R "$SOURCE_TEMPLATE_DIR" "$SOURCE_TARGET_DIR"

# Update package.json name
PACKAGE_JSON="$SOURCE_TARGET_DIR/package.json"
if [ -f "$PACKAGE_JSON" ]; then
    sed -i.bak "s/hello-world/$FUNCTION_NAME/g" "$PACKAGE_JSON"
    rm "$PACKAGE_JSON.bak"
    echo "Updated package.json"
fi

echo "Function '$FUNCTION_NAME' created successfully!"

