#!/bin/bash

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script and project paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
INTERWEB_ROOT="$(cd "${SCRIPT_DIR}/../../.." &> /dev/null && pwd)"
MANIFESTS_DIR="${INTERWEB_ROOT}/packages/manifests/operators"

# Flags (can be overridden via env or CLI)
MONITORING_ENABLED="${MONITORING_ENABLED:-false}"

usage() {
  cat <<EOF
Usage: $(basename "$0") [--with-monitoring] [--without-monitoring]

Installs cluster infrastructure for the Interweb stack using the
checked-in operator manifests:
  - cert-manager
  - ingress-nginx
  - (optional) kube-prometheus-stack

Environment variables:
  MONITORING_ENABLED=true|false   Enable kube-prometheus-stack (default: false)
EOF
}

# Function to print colored messages
log() {
    local color=$1
    shift
    echo -e "${color}$*${NC}"
}

# Parse simple CLI flags
while [[ "${1:-}" != "" ]]; do
  case "$1" in
    --with-monitoring)
      MONITORING_ENABLED=true
      shift
      ;;
    --without-monitoring)
      MONITORING_ENABLED=false
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      log $RED "Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

# Ensure kubectl is available
if ! command -v kubectl >/dev/null 2>&1; then
  log $RED "kubectl is required but not found in PATH"
  exit 1
fi

# Function to check if a namespace exists
namespace_exists() {
    kubectl get namespace "$1" &> /dev/null
}

# Function to wait for pods to be ready
wait_for_pods() {
    local namespace=$1
    local timeout=${2:-300}

    log $BLUE "Waiting for pods in namespace '$namespace' to be ready..."
    # This will succeed even if there are temporarily no pods yet; we rely on
    # the manifests creating the expected controllers.
    kubectl wait --for=condition=Ready pods --all -n "$namespace" --timeout="${timeout}s" || \
      log $YELLOW "Timed out waiting for pods in namespace '$namespace'; check manually if needed."
}

apply_manifest_file() {
    local file=$1
    if [[ ! -f "$file" ]]; then
        log $RED "Manifest file not found: $file"
        exit 1
    fi
    log $BLUE "Applying manifests from $file ..."
    kubectl apply -f "$file"
}

install_cert_manager() {
    local ns="cert-manager"
    local manifest="${MANIFESTS_DIR}/cert-manager.yaml"

    if namespace_exists "$ns"; then
        log $YELLOW "Namespace '$ns' already exists; cert-manager may already be installed. Skipping apply."
        return
    fi

    log $BLUE "Installing cert-manager from local manifests..."
    apply_manifest_file "$manifest"
    wait_for_pods "$ns" 600
    log $GREEN "cert-manager installed (namespace: $ns)"
}

install_ingress_nginx() {
    local ns="ingress-nginx"
    local manifest="${MANIFESTS_DIR}/ingress-nginx.yaml"

    if namespace_exists "$ns"; then
        log $YELLOW "Namespace '$ns' already exists; ingress-nginx may already be installed. Skipping apply."
        return
    fi

    log $BLUE "Installing ingress-nginx from local manifests..."
    apply_manifest_file "$manifest"
    wait_for_pods "$ns" 600
    log $GREEN "ingress-nginx installed (namespace: $ns)"
}

install_monitoring_stack() {
    local ns="monitoring"
    local manifest="${MANIFESTS_DIR}/kube-prometheus-stack.yaml"

    if [[ "$MONITORING_ENABLED" != "true" ]]; then
        log $YELLOW "Monitoring stack is disabled (MONITORING_ENABLED=false). Skipping."
        return
    fi

    if namespace_exists "$ns"; then
        log $YELLOW "Namespace '$ns' already exists; kube-prometheus-stack may already be installed. Skipping apply."
        return
    fi

    log $BLUE "Installing kube-prometheus-stack from local manifests..."
    apply_manifest_file "$manifest"
    wait_for_pods "$ns" 600
    log $GREEN "kube-prometheus-stack installed (namespace: $ns)"
}

main() {
    log $BLUE "=== Cluster Infrastructure Setup (cert-manager, ingress, monitoring) ==="

    install_cert_manager
    install_ingress_nginx
    install_monitoring_stack

    log $GREEN "=== Cluster infrastructure setup completed ==="
    if [[ "$MONITORING_ENABLED" == "true" ]]; then
        log $BLUE "Installed components: cert-manager, ingress-nginx, kube-prometheus-stack"
    else
        log $BLUE "Installed components: cert-manager, ingress-nginx"
        log $YELLOW "Monitoring stack (kube-prometheus-stack) is disabled by default. Re-run with MONITORING_ENABLED=true or --with-monitoring to install it."
    fi
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
