# Local Kubernetes Setup

Two modes are available for local k8s development. Both use the `constructive-functions` namespace.

## Option A: Plain k8s (local-simple) — Recommended

Uses plain Deployments + Services. No operators needed. This is the default for `make skaffold-dev` and CI.

See [DEVELOPMENT.md](../DEVELOPMENT.md#k8s-local-development-skaffold) for full setup instructions.

```bash
make skaffold-dev    # builds, deploys, watches for changes
```

## Option B: Knative (local)

Uses Knative Serving + Kourier for functions (closer to production). Requires operator install.

### Step 1: Create a local cluster

Docker Desktop (enable Kubernetes), kind, k3d, or minikube.

### Step 2: Install Knative

```bash
cd k8s/scripts/setup
make operators-knative-only
```

This installs Knative Serving + Kourier and configures an internal domain (`svc.cluster.local`).

### Step 3: GHCR pull secret

```bash
kubectl create namespace constructive-functions --dry-run=client -o yaml | kubectl apply -f -
kubectl create secret docker-registry ghcr-pull \
  --docker-server=ghcr.io \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_GH_PAT_TOKEN \
  --docker-email=your@email.com \
  -n constructive-functions
kubectl patch serviceaccount default -n constructive-functions \
  -p '{"imagePullSecrets": [{"name": "ghcr-pull"}]}'
```

### Step 4: Deploy

```bash
make skaffold-dev-knative
```

### Step 5: Verify

```bash
kubectl get pods -n constructive-functions
kubectl get ksvc -n constructive-functions
```

## Knative Resource Trimming (CI / constrained environments)

Knative's control-plane components request significant resources by default. On small clusters (kind in CI, minikube with low memory), you may need to shrink them:

```bash
# Knative Serving control-plane
kubectl -n knative-serving set resources deploy/activator \
  --requests=cpu=50m,memory=80Mi --limits=cpu=200m,memory=256Mi
kubectl -n knative-serving set resources deploy/autoscaler \
  --requests=cpu=25m,memory=80Mi --limits=cpu=200m,memory=256Mi
kubectl -n knative-serving set resources deploy/controller \
  --requests=cpu=50m,memory=100Mi --limits=cpu=300m,memory=512Mi
kubectl -n knative-serving set resources deploy/webhook \
  --requests=cpu=25m,memory=80Mi --limits=cpu=200m,memory=256Mi
kubectl -n knative-serving set resources deploy/net-kourier-controller \
  --requests=cpu=25m,memory=80Mi --limits=cpu=200m,memory=256Mi

# Kourier gateway
kubectl -n kourier-system set resources deploy/3scale-kourier-gateway \
  --requests=cpu=25m,memory=80Mi --limits=cpu=200m,memory=256Mi

# CoreDNS (optional — scale to 1 replica)
kubectl -n kube-system scale deploy/coredns --replicas=1
kubectl -n kube-system set resources deploy/coredns \
  --requests=cpu=50m,memory=70Mi --limits=cpu=200m,memory=170Mi

# Restart pods so changes take effect
kubectl -n knative-serving rollout restart deploy/activator deploy/autoscaler \
  deploy/controller deploy/webhook deploy/net-kourier-controller
kubectl -n kourier-system rollout restart deploy/3scale-kourier-gateway
kubectl -n kube-system rollout restart deploy/coredns
```

This is not needed for the `local-simple` profile (no Knative). The CI workflow currently uses `local-simple` via Skaffold, so Knative trimming is not applied. If CI switches back to the Knative-based `local` overlay in the future, add these commands after operator install.
