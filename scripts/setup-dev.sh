#!/usr/bin/env bash
#
# setup-dev.sh — install local k8s development dependencies
#
# Installs: kubectl, skaffold, pnpm (if missing)
# Supports: macOS (amd64/arm64), Linux (amd64/arm64)
#
# Usage:
#   ./scripts/setup-dev.sh          # install all missing tools
#   ./scripts/setup-dev.sh --check  # just report what's installed/missing

set -euo pipefail

# --- Detect OS and architecture ---

detect_platform() {
  local os arch

  case "$(uname -s)" in
    Darwin) os="darwin" ;;
    Linux)  os="linux" ;;
    *)      echo "Unsupported OS: $(uname -s)" >&2; exit 1 ;;
  esac

  case "$(uname -m)" in
    x86_64|amd64)  arch="amd64" ;;
    arm64|aarch64) arch="arm64" ;;
    *)             echo "Unsupported architecture: $(uname -m)" >&2; exit 1 ;;
  esac

  OS="$os"
  ARCH="$arch"
}

# --- Helpers ---

info()  { echo "==> $*"; }
ok()    { echo "  [ok] $*"; }
skip()  { echo "  [skip] $* (already installed)"; }
fail()  { echo "  [error] $*" >&2; }

command_exists() { command -v "$1" &>/dev/null; }

# Returns 0 if we can write to /usr/local/bin without sudo
can_write_local_bin() { [ -w /usr/local/bin ]; }

install_binary() {
  local name="$1" url="$2"
  local tmp
  tmp="$(mktemp)"

  info "Installing $name..."
  curl -fsSL -o "$tmp" "$url"
  chmod +x "$tmp"

  if can_write_local_bin; then
    mv "$tmp" /usr/local/bin/"$name"
  else
    sudo install "$tmp" /usr/local/bin/"$name"
    rm -f "$tmp"
  fi

  ok "$name $(command -v "$name")"
}

# --- Tool installers ---

install_kubectl() {
  if command_exists kubectl; then
    skip "kubectl $(kubectl version --client -o json 2>/dev/null | grep gitVersion | head -1 | tr -d ' ",' | cut -d: -f2)"
    return
  fi

  local url="https://dl.k8s.io/release/$(curl -fsSL https://dl.k8s.io/release/stable.txt)/bin/${OS}/${ARCH}/kubectl"
  install_binary kubectl "$url"
}

install_skaffold() {
  if command_exists skaffold; then
    skip "skaffold $(skaffold version 2>/dev/null || echo 'unknown')"
    return
  fi

  local url="https://storage.googleapis.com/skaffold/releases/latest/skaffold-${OS}-${ARCH}"
  install_binary skaffold "$url"
}

install_pnpm() {
  if command_exists pnpm; then
    skip "pnpm $(pnpm --version 2>/dev/null)"
    return
  fi

  info "Installing pnpm..."
  curl -fsSL https://get.pnpm.io/install.sh | sh -
  ok "pnpm"
}

install_node() {
  if command_exists node; then
    local ver
    ver="$(node --version 2>/dev/null)"
    local major="${ver#v}"
    major="${major%%.*}"
    if [ "$major" -ge 18 ] 2>/dev/null; then
      skip "node $ver"
      return
    else
      fail "node $ver found but >= 18 required"
      return 1
    fi
  fi

  fail "node not found — install Node.js >= 18 (https://nodejs.org)"
  return 1
}

# --- Check mode ---

check_tool() {
  local name="$1"
  if command_exists "$name"; then
    local ver
    case "$name" in
      node)     ver="$(node --version 2>/dev/null)" ;;
      pnpm)     ver="$(pnpm --version 2>/dev/null)" ;;
      kubectl)  ver="$(kubectl version --client -o json 2>/dev/null | grep gitVersion | head -1 | tr -d ' ",' | cut -d: -f2)" ;;
      skaffold) ver="$(skaffold version 2>/dev/null)" ;;
      docker)   ver="$(docker --version 2>/dev/null)" ;;
      *)        ver="installed" ;;
    esac
    printf "  %-12s %s\n" "$name" "$ver"
  else
    printf "  %-12s %s\n" "$name" "(missing)"
  fi
}

run_check() {
  echo ""
  echo "Development tool status (${OS}/${ARCH}):"
  echo ""
  check_tool node
  check_tool pnpm
  check_tool docker
  check_tool kubectl
  check_tool skaffold
  echo ""

  if ! command_exists docker; then
    echo "Note: Docker Desktop provides both docker and kubectl."
    echo "      Install from https://www.docker.com/products/docker-desktop/"
    echo "      Then enable Kubernetes in Docker Desktop settings."
  fi
  echo ""
}

# --- Main ---

detect_platform

if [ "${1:-}" = "--check" ]; then
  run_check
  exit 0
fi

echo ""
echo "Setting up local k8s development tools (${OS}/${ARCH})"
echo ""

install_node
install_pnpm
install_kubectl
install_skaffold

echo ""
echo "Done. Verify with:  ./scripts/setup-dev.sh --check"
echo ""
echo "Next steps:"
echo "  1. Enable Kubernetes in Docker Desktop settings"
echo "  2. pnpm generate && pnpm install && pnpm build"
echo "  3. make skaffold-dev"
echo ""
