# Kubernetes Configuration

This directory contains Kubernetes manifests for deploying the Constructive Functions playground.

## Structure

- `namespace.yaml` - Namespace configuration for isolating resources
- `deployment.yaml` - Deployment configuration for the functions runtime
- `service.yaml` - Service configuration for exposing functions
- `configmap.yaml` - ConfigMap for function configurations
- `ingress.yaml` - Ingress configuration for external access (optional)

## Deployment

To deploy the functions playground to your Kubernetes cluster:

```bash
# Create the namespace
kubectl apply -f k8s/namespace.yaml

# Deploy the configurations
kubectl apply -f k8s/

# Check the status
kubectl get pods -n constructive-functions
kubectl get services -n constructive-functions
```

## Prerequisites

- Kubernetes cluster (local or cloud)
- kubectl configured to connect to your cluster
- Container registry access for pushing function images

## Configuration

Modify the configurations in this directory to match your environment:
- Update image references in `deployment.yaml`
- Adjust resource limits based on your cluster capacity
- Configure ingress rules in `ingress.yaml` for your domain
