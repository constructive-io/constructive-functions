# Local Kubernetes Setup (No Ingress, With Knative)

This document describes a local Kubernetes setup for the Constructive / LaunchQL stack that:

- Runs on a local cluster (kind, minikube, k3d, etc.).
- Uses a single Postgres Deployment (no CNPG operator).
- Uses a single MinIO Deployment (no MinIO Tenant/Operator).
- Keeps Knative + Kourier for jobs/functions.
- Uses a single namespace: `interweb`.
- Exposes everything via `kubectl port-forward` and localhost URLs.
- Runs email functions in dry-run mode, so Mailgun secrets are optional.

See the repository docs and manifests for the authoritative configuration.

## Prerequisite: GHCR image pull secret

The dashboard and database job images are hosted on GitHub Container Registry
(`ghcr.io`). Before applying the local overlay, you must create the `ghcr-pull`
image pull secret in the `interweb` namespace so the cluster can pull these
images.

1. Create a `k8s/.env` file (this file is gitignored) with your GHCR
   credentials:

   ```bash
   # k8s/.env
   GH_USERNAME=your-ghcr-username
   GH_PAT_TOKEN=your-ghcr-read-packages-token
   GH_EMAIL=you@example.com
   ```

2. Ensure your `kubectl` context points at your local cluster (kind, minikube,
   k3d, etc.).

3. From the `k8s` directory, create or update the `ghcr-pull` secret:

   ```bash
   cd k8s
   make k8s-pull-secret
   ```

This will create a `ghcr-pull` `docker-registry` secret in the `interweb`
namespace, which is referenced by the `dashboard` Deployment and the
`constructive-db` Job.

## Step 1: Create a local Kubernetes cluster

Setup with docker-desktop. Enable kubernetes on docker desktop

## Step 2: Install Knative (operators-knative-only)

The local setup keeps Knative + Kourier for jobs/functions but does **not**
require ingress or CNPG. From the `k8s` directory:

```bash
cd k8s
make operators-knative-only
```

This will:

- Install Knative Serving + Kourier.
- Configure Knative to use an internal domain (`svc.cluster.local`) so Knative
  services are reachable inside the cluster.

For the “no ingress, single Postgres, single MinIO” local setup, the
`operators-knative-only` target is sufficient.

## Step 3: Apply the local overlay

With your cluster and operators ready, apply the local Kustomize overlay:

```bash
cd k8s

# Apply the entire local stack (namespace, Postgres Deployment, MinIO,
# Constructive server/admin/dashboard, pgAdmin, jobs, and functions)
make kustomize-local
```

You can inspect the rendered YAML without applying it by running:

```bash
make render-local
```

## Step 4: Verify workloads

Check that pods are starting in the `interweb` namespace:

```bash
kubectl get namespaces
kubectl get pods -n interweb
kubectl get svc -n interweb
```

You should see at least:

- `deployment/constructive-server`
- `deployment/dashboard`
- `deployment/knative-job-service`
- `deployment/postgres`
- `ksvc/simple-email`, `ksvc/send-email-link`

## Step 5: Access services via port-forward

The local setup does not use an Ingress; access is via `kubectl port-forward`.
Convenience targets are provided in `k8s/Makefile`. From the `k8s` directory:

```bash
cd k8s

# Constructive Server (API + GraphQL) -> http://localhost:8080
make proxy-server

# Explorer (GraphQL explorer UI) -> http://localhost:8081
make proxy-explorer

# Dashboard UI -> http://localhost:3000
make proxy-web
```

Run each of these in its own terminal (Ctrl+C to stop). You can also reach
pgAdmin if desired:

```bash
kubectl -n interweb port-forward svc/pgadmin 3001:80
```

With these steps, you have a fully functional local Kubernetes environment for
the Constructive / LaunchQL stack using the `overlays/local` manifests.
