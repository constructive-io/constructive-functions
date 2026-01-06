#!/bin/bash

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Namespaces (override via env vars if needed)
DB_NAMESPACE="${DB_NAMESPACE:-postgres-db}"
APP_NAMESPACE="${APP_NAMESPACE:-postgres-db}"

# Function to print colored messages
log() {
    local color=$1
    shift
    echo -e "${color}$*${NC}"
}

# Function to check if a resource exists
resource_exists() {
    kubectl get "$1" "$2" -n "$3" &> /dev/null 2>&1
}

# Function to check if a namespace exists
namespace_exists() {
    kubectl get namespace "$1" &> /dev/null
}

# Cleanup Knative applications
cleanup_knative_apps() {
    log $BLUE "Cleaning up Knative applications..."
    
    if resource_exists ksvc postgres-backend-api "$APP_NAMESPACE"; then
        log $YELLOW "Deleting Knative service: postgres-backend-api"
        kubectl delete ksvc postgres-backend-api -n "$APP_NAMESPACE"
    fi
    
    # Clean up any test pods
    kubectl delete pods -l run=curl-test --ignore-not-found=true
    kubectl delete pods -l run=postgres-test --ignore-not-found=true
    
    log $GREEN "Knative applications cleanup completed!"
}

# Cleanup PostgreSQL resources
cleanup_postgres() {
    log $BLUE "Cleaning up PostgreSQL resources..."
    
    # Delete pooler first (depends on cluster)
    if resource_exists pooler postgres-pooler "$DB_NAMESPACE"; then
        log $YELLOW "Deleting PostgreSQL pooler: postgres-pooler"
        kubectl delete pooler postgres-pooler -n "$DB_NAMESPACE"
        
        # Wait for pooler to be deleted
        while resource_exists pooler postgres-pooler "$DB_NAMESPACE"; do
            log $YELLOW "Waiting for pooler to be deleted..."
            sleep 5
        done
    fi
    
    # Delete cluster
    if resource_exists cluster postgres-cluster "$DB_NAMESPACE"; then
        log $YELLOW "Deleting PostgreSQL cluster: postgres-cluster"
        kubectl delete cluster postgres-cluster -n "$DB_NAMESPACE"
        
        # Wait for cluster to be deleted
        while resource_exists cluster postgres-cluster "$DB_NAMESPACE"; do
            log $YELLOW "Waiting for cluster to be deleted..."
            sleep 10
        done
    fi
    
    # Delete secrets
    if resource_exists secret postgres-superuser "$DB_NAMESPACE"; then
        log $YELLOW "Deleting PostgreSQL secrets"
        kubectl delete secret postgres-superuser -n "$DB_NAMESPACE" --ignore-not-found=true
        kubectl delete secret postgres-app-user -n "$DB_NAMESPACE" --ignore-not-found=true
    fi
    
    if resource_exists secret postgres-db-config "$APP_NAMESPACE"; then
        kubectl delete secret postgres-db-config -n "$APP_NAMESPACE" --ignore-not-found=true
    fi
    
    log $GREEN "PostgreSQL cleanup completed!"
}

# Cleanup namespaces
cleanup_namespaces() {
    log $BLUE "Cleaning up namespaces..."
    
    if namespace_exists "$APP_NAMESPACE"; then
        log $YELLOW "Deleting namespace: $APP_NAMESPACE"
        kubectl delete namespace "$APP_NAMESPACE"
    fi
    
    if namespace_exists "$DB_NAMESPACE"; then
        log $YELLOW "Deleting namespace: $DB_NAMESPACE"
        kubectl delete namespace "$DB_NAMESPACE"
    fi
    
    log $GREEN "Namespaces cleanup completed!"
}

# Cleanup operators (optional)
cleanup_operators() {
    log $BLUE "Cleaning up operators..."
    
    # Ask user if they want to remove operators
    read -p "Do you want to remove CloudNativePG operator? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log $YELLOW "Removing CloudNativePG operator..."
        kubectl delete -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.25/releases/cnpg-1.25.2.yaml --ignore-not-found=true
        
        # Wait for namespace to be deleted
        while namespace_exists cnpg-system; do
            log $YELLOW "Waiting for cnpg-system namespace to be deleted..."
            sleep 5
        done
    fi
    
    read -p "Do you want to remove Knative Serving? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log $YELLOW "Removing Knative Serving..."
        
        # Remove Kourier
        kubectl delete -f https://github.com/knative/net-kourier/releases/download/knative-v1.15.0/kourier.yaml --ignore-not-found=true
        
        # Remove Knative Serving core
        kubectl delete -f https://github.com/knative/serving/releases/download/knative-v1.15.0/serving-core.yaml --ignore-not-found=true
        
        # Remove Knative Serving CRDs
        kubectl delete -f https://github.com/knative/serving/releases/download/knative-v1.15.0/serving-crds.yaml --ignore-not-found=true
        
        # Wait for namespaces to be deleted
        for ns in knative-serving kourier-system; do
            while namespace_exists $ns; do
                log $YELLOW "Waiting for $ns namespace to be deleted..."
                sleep 5
            done
        done
    fi
    
    log $GREEN "Operators cleanup completed!"
}

# Cleanup cluster infrastructure (optional)
cleanup_infrastructure() {
    log $BLUE "Cleaning up cluster infrastructure..."
    
    read -p "Do you want to remove cert-manager? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log $YELLOW "Removing cert-manager..."
        helm uninstall cert-manager -n cert-manager --ignore-not-found || true
        kubectl delete namespace cert-manager --ignore-not-found=true
    fi
    
    read -p "Do you want to remove ingress controller? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log $YELLOW "Removing ingress controller..."
        helm uninstall ingress-nginx -n ingress-nginx --ignore-not-found || true
        kubectl delete namespace ingress-nginx --ignore-not-found=true
    fi
    
    read -p "Do you want to remove monitoring stack? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log $YELLOW "Removing monitoring stack..."
        helm uninstall kube-prometheus-stack -n monitoring --ignore-not-found || true
        kubectl delete namespace monitoring --ignore-not-found=true
    fi
    
    log $GREEN "Infrastructure cleanup completed!"
}

# Cleanup container images
cleanup_images() {
    log $BLUE "Cleaning up container images..."
    
    read -p "Do you want to remove built container images? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log $YELLOW "Removing container images..."
        
        # Remove local images
        docker rmi postgres-knative-backend-api:latest --force 2>/dev/null || true
        docker rmi localhost:5001/postgres-knative-backend-api:latest --force 2>/dev/null || true
        
        # Stop and remove local registry if it exists
        if docker ps -a | grep -q local-registry; then
            log $YELLOW "Stopping and removing local registry..."
            docker stop local-registry 2>/dev/null || true
            docker rm local-registry 2>/dev/null || true
        fi
        
        # Clean up dangling images
        docker image prune -f 2>/dev/null || true
    fi
    
    log $GREEN "Container images cleanup completed!"
}

# Display remaining resources
display_remaining_resources() {
    log $BLUE "=== Remaining Resources Check ==="
    
    log $BLUE "Checking for remaining PostgreSQL resources..."
    kubectl get clusters,poolers,backups -A 2>/dev/null || true
    
    log $BLUE "Checking for remaining Knative resources..."
    kubectl get ksvc,configurations,routes,revisions -A 2>/dev/null || true
    
    log $BLUE "Checking for remaining namespaces..."
    kubectl get namespaces | grep -E "(postgres|knative|cnpg|monitoring|ingress|cert-manager)" || log $GREEN "No related namespaces found"
    
    log $BLUE "Checking for remaining PVCs..."
    kubectl get pvc -A | grep -E "(postgres|cnpg)" || log $GREEN "No PostgreSQL-related PVCs found"
}

# Main cleanup function
main() {
    log $BLUE "=== PostgreSQL + Knative Stack Cleanup ==="
    log $YELLOW "This will remove all deployed resources from the stack."
    
    read -p "Are you sure you want to continue? [y/N]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log $YELLOW "Cleanup cancelled."
        exit 0
    fi
    
    log $BLUE "Starting cleanup process..."
    
    # Cleanup in reverse order of deployment
    cleanup_knative_apps
    cleanup_postgres
    cleanup_namespaces
    
    # Ask about operators and infrastructure
    read -p "Do you want to remove operators and infrastructure? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cleanup_operators
        cleanup_infrastructure
    fi
    
    cleanup_images
    display_remaining_resources
    
    log $GREEN "=== Cleanup completed! ==="
    log $YELLOW "Note: Some resources may take a few minutes to be fully removed."
    log $YELLOW "PersistentVolumes may need to be manually deleted if using retain policy."
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
