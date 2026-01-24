#!/bin/bash
set -e

# Configuration
REPO_URL="${CALVIN_REPO_URL:-https://github.com/constructive-io/calvincode.git}"
BUILD_DIR="_calvincode_build"
TARGET_BINARY_PATH="packages/opencode/dist/opencode-linux-arm64-musl/bin/opencode"
DEST_BIN="bin/opencode"

echo "[Build] Starting source build of Opencode (Calvincode)..."

# Ensure git is present
if ! command -v git &> /dev/null; then
    echo "[Error] git is not installed. Please install git."
    exit 1
fi

# Ensure bun is present (Required for opencode build)
if ! command -v bun &> /dev/null; then
    echo "[Info] bun not found. Installing bun..."
    if command -v pnpm &> /dev/null; then
         pnpm add -g bun
    elif command -v npm &> /dev/null; then
         npm install -g bun
    else
         echo "[Error] pnpm/npm not found. Cannot install bun."
         exit 1
    fi
fi

# Cleanup previous build
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Clone Repository (Recursive for submodules like knowledge/agentickit)
echo "[Build] Cloning $REPO_URL (Recursive)..."
git clone --depth 1 --recursive "$REPO_URL" "$BUILD_DIR"

# Patch Build Script to Only Build Linux ARM64 Musl (Optimization & Stability)
BUILD_SCRIPT="$BUILD_DIR/packages/opencode/script/build.ts"
echo "[Build] Patching build script at $BUILD_SCRIPT..."

# 1. Replace targets definition block (lines 81-95) with minimal target
# Using strict line numbers based on known file structure
sed -i.bak '81,95c\
const targets = [{ os: "linux", arch: "arm64", abi: "musl" }];' "$BUILD_SCRIPT"

# 2. Restrict aggressive multi-platform installs to just linux-arm64
sed -i.bak 's/--os="\*" --cpu="\*"/--os=linux --cpu=arm64/g' "$BUILD_SCRIPT"

# Debug: Inspect Repo Structure
echo "[Build] Listing packages directory:"
ls -F "$BUILD_DIR/packages"

echo "[Build] Reading root package.json workspaces:"
cat "$BUILD_DIR/package.json"

# Build Opencode
echo "[Build] Building Opencode..."

# Install dependencies at WORKSPACE ROOT to link internal packages correctly
cd "$BUILD_DIR"
bun install
bun add -d @types/bs58 # Fix for missing type definition in embeddings build

# Force install potential missing dependencies in embeddings
cd packages/embeddings
bun add bs58 text-encoding
bun add -d @types/bs58 @types/text-encoding
cd ../..

# Force install potential missing dependencies in knowledge
cd packages/knowledge
bun add -d @types/bs58 @types/text-encoding
cd ../..

# PATCH: Prevent implicit type loading which causes TS2688, but keep node and jest types
echo "[Build] Patching tsconfig.json to disable implicit types..."
for pkg in embeddings knowledge sdk/js; do
  if [ -f "packages/$pkg/tsconfig.json" ]; then
     sed -i.bak 's/"compilerOptions": {/"compilerOptions": { "types": ["node", "jest"],/g' "packages/$pkg/tsconfig.json"
     echo "Patched packages/$pkg/tsconfig.json"
  fi
done

# Debug: Check if workspace links exist
echo "[Build] Verifying workspace links..."
ls -la node_modules/@opencode-ai || echo "No @opencode-ai in node_modules"

# Build Dependencies sequentially (Topological sort manual override)
echo "[Build] Building embeddings..."
bun run --filter '@opencode-ai/embeddings' build
echo "[Build] Building knowledge..."
bun run --filter '@opencode-ai/knowledge' build
echo "[Build] Building sdk..."
bun run --filter '@opencode-ai/sdk' build

# Run Build using filter (runs in package context but initiated from root)
echo "[Build] Running bun run --filter opencode build..."
bun run --filter opencode build

# Verify Binary
if [ ! -f "$TARGET_BINARY_PATH" ]; then
    echo "[Error] Binary not found at $TARGET_BINARY_PATH after build."
    echo "Current directory contents of packages/opencode/dist:"
    ls -R packages/opencode/dist || echo "packages/opencode/dist not found"
    exit 1
fi

# Copy Binary
cd ..
mkdir -p "$(dirname "$DEST_BIN")"
cp "$BUILD_DIR/$TARGET_BINARY_PATH" "$DEST_BIN"
chmod +x "$DEST_BIN"

echo "[Build] Success! Binary built and installed to $DEST_BIN"

# Cleanup (Optional: Keep build dir for cache? For now, clean to be fresh)
rm -rf "$BUILD_DIR"
