# Interweb / Constructive Kubernetes Setup

This folder contains the Kubernetes manifests and Kustomize overlays for running
the Constructive stack (Postgres, CNPG, API, dashboard, jobs + functions) across
dev, staging, and local clusters.

## Makefile entry points

From repo root:

```sh
cd interweb/k8s
```

- Install operators (CloudNativePG, Knative, etc.)

  ```sh
  make setup
  ```

- Install / remove the CNPG cluster + PgBouncer

  ```sh
  make install-pg
  make uninstall-pg
  ```

- Apply app stack via Kustomize overlays

  ```sh
  # Dev cluster (namespace: interweb, launchql.dev ingress)
  kubectl config use-context your-dev-context
  make kustomize-dev

  # Staging cluster (namespace: interweb-staging, CNPG backups, ingress TBD)
  kubectl config use-context your-staging-context
  make kustomize-staging

  # Local cluster (namespace: interweb, single Postgres + MinIO deployments, no ingress)
  kubectl config use-context your-local-context
  make kustomize-local
  ```

- Create GHCR image pull secret in dev namespace

  ```sh
  GH_USERNAME=... GH_PAT_TOKEN=... GH_EMAIL=... make k8s-pull-secret
  ```

## Kustomize layout

- `base/` – shared pieces:
  - `base/cnpg/*` – CNPG cluster, secret, and `postgres-db` namespace.
  - `base/constructive/*` – Constructive config, secrets, API, admin, dashboard,
    pgAdmin, knative job service, db job, etc.
  - `base/functions/*` – Knative functions (`simple-email`, `send-email-link`).
- `overlays/dev/` – dev environment:
  - `namespace: interweb`.
  - Adds `interweb` namespace, Route53 issuer, and `launchql.dev` ingress for
    API, dashboard, and pgAdmin.
  - Patches dashboard config to point at `https://api.launchql.dev/graphql`.
- `overlays/staging/` – staging environment:
  - `namespace: interweb-staging`.
  - Reuses base stack and adds CNPG `Backup` and `ScheduledBackup` resources
    pointing directly at an S3 bucket (via `postgres-backup-credentials`).
  - Staging ingress/domain still to be defined.
- `overlays/local/` – local environment:
  - `namespace: interweb`.
  - Uses a single `postgres` Deployment + Service instead of CNPG.
  - Adds a single `minio` Deployment + Service for S3-compatible storage.
  - Reuses Constructive + functions manifests from `base/constructive` and
    `base/functions`.
  - No ingress; use `kubectl port-forward` for access.

## Notes

- `make setup` delegates to `packages/client/scripts/setup-operators.ts`, which
  installs operators via manifests/Helm.
- Secrets in manifests (`postgres*`, `pg-credentials`, mailgun, etc.) are
  development defaults; replace them or manage them via your secret manager
  before production use.

For a deeper architectural overview, see `ARCHITECTURE.md` in this directory.
