# Constructive Functions — Kubernetes Manifests

Kustomize bases and overlays for deploying the Constructive Functions stack (Postgres, GraphQL server, job service, function workloads) to local clusters and remote environments.

For end-to-end local development instructions, see the root [`DEVELOPMENT.md`](../DEVELOPMENT.md). For the Knative-based local variant, see [`DEVELOPMENT_LOCAL.md`](./DEVELOPMENT_LOCAL.md). For an architectural overview, see [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Layout

```
k8s/
├── base/                # Shared manifests (CNPG cluster, Constructive server, pgAdmin, job service)
├── overlays/
│   ├── local-simple/    # Plain k8s — no Knative, no CNPG. Used by `make skaffold-dev`.
│   ├── local/           # Knative variant — Knative Services for functions, plain Postgres + MinIO.
│   ├── ci/              # Built on top of `local`, scaled down for kind clusters.
│   ├── dev/             # Dev cluster — CNPG, ingress, launchql.dev domains.
│   └── staging/         # Staging cluster — CNPG with backups; ingress TBD.
└── scripts/             # Operator install/teardown helpers.
```

| Overlay | Namespace | Postgres | Functions | Ingress | Notes |
|---------|-----------|----------|-----------|---------|-------|
| `local-simple` | `constructive-functions` | Plain Deployment | Plain Deployments (rawYaml from `generated/`) | None | Default for `make skaffold-dev`. |
| `local` | `constructive-functions` | Plain Deployment | Knative Services | None | Requires Knative + Kourier (`make operators-knative-only`). |
| `ci` | `constructive-functions` | Plain Deployment | Knative Services (scaled down) | None | Used by `CI Test K8s` workflow. |
| `dev` | `interweb` | CloudNativePG cluster | Knative Services | `launchql.dev` (nginx + cert-manager DNS01) | |
| `staging` | `interweb` | CloudNativePG cluster + backups | Knative Services | TBD | |

The active path for laptop development is `local-simple` via Skaffold from the repo root:

```bash
make skaffold-dev          # plain k8s
make skaffold-dev-knative  # Knative variant (requires operators)
```

## GHCR pull secret

The `constructive-functions` namespace needs a `ghcr-pull` secret to pull private images from `ghcr.io/constructive-io/`:

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

If pods show `ImagePullBackOff`, this secret is missing or the PAT has expired.

## Notes

- Function deployments are not in the `local-simple` overlay — Skaffold consumes the per-function manifests generated under `generated/<name>/k8s/` directly. Run `pnpm generate` after editing any `handler.json`.
- Secrets in `base/` (Postgres, Mailgun, server bucket) are development defaults; replace them via your secret manager before any non-local use.
