# Kubernetes Configuration

This directory contains Kubernetes manifest templates for deploying the Constructive Functions playground.

**Important**: These are template configurations that require customization before deployment. The deployment.yaml uses a placeholder image that needs to be replaced with your actual functions runtime.

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
- A custom container image with your functions runtime
  - The runtime must serve HTTP on port 3000
  - Should implement `/health` and `/ready` endpoints for health checks
- Container registry access for pushing function images

## Before Deployment

**You must customize these templates before deploying:**

1. **Update the container image** in `deployment.yaml`:
   ```yaml
   image: your-registry/functions-runtime:tag
   ```

2. **Add startup command** if needed:
   ```yaml
   command: ["node", "server.js"]
   ```

3. **Uncomment health probes** in `deployment.yaml` after implementing the endpoints

4. **Update ingress host** in `ingress.yaml` to match your domain

## Configuration

Modify the configurations in this directory to match your environment:
- Update image references in `deployment.yaml`
- Adjust resource limits based on your cluster capacity
- Configure ingress rules in `ingress.yaml` for your domain
