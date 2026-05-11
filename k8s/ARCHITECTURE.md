# Constructive Functions — Kubernetes Architecture

This document summarizes the Kubernetes layout under `k8s/`, highlights strengths and shortcomings, and sketches directions for improvement and local‑development variants.

## High‑Level Overview

- **Cluster operators** (only required for `dev`, `staging`, and the Knative `local` overlay)
  - CloudNativePG (CNPG) operator for Postgres (dev/staging only).
  - Knative Serving + Kourier for internal HTTP functions.
  - cert-manager + ingress-nginx for TLS and HTTP ingress (dev only).
- **Namespaces**
  - `postgres-db`: CloudNativePG `Cluster` + PgBouncer `Pooler` (dev/staging).
  - App namespaces are overlay‑specific:
    - `constructive-functions` (`local-simple`, `local`, `ci`).
    - `interweb` (`dev`).
    - `interweb` (`staging`).
- **Workloads**
  - `postgres-cluster` (CNPG) with PgBouncer `postgres-pooler` — dev/staging only.
  - `constructive-server` (API + Explorer sidecar).
  - `dashboard` (Next.js UI) — dev/staging.
  - `pgadmin` (DB admin UI) — dev/staging/local.
  - `knative-job-service` (job orchestration for functions).
  - Function workloads (`send-email`, `send-verification-link`, `knative-job-example`, `python-example`) — Knative Services in `local`/`dev`/`staging`, plain Deployments in `local-simple`.

The repo-root `Makefile` wires this together via `make skaffold-dev` / `make skaffold-dev-knative` (local), and `k8s/scripts/setup` plus the kustomize overlays for remote environments.

## Local-development overlay (`local-simple`)

The `local-simple` overlay is the primary path for laptop development. It deliberately strips out operators:

- Plain `postgres` Deployment + Service (no CNPG operator, no PgBouncer).
- `minio` Deployment for S3-compatible storage.
- Plain function Deployments (no Knative). Function manifests are not part of the kustomize tree — Skaffold consumes the per-function `generated/<name>/k8s/local-deployment.yaml` files directly via `manifests.rawYaml`, and `pnpm generate` keeps them in sync with each `handler.json`.
- No ingress; access via `kubectl port-forward` (handled automatically by Skaffold).
- Namespace: `constructive-functions`.

This is what `make skaffold-dev` deploys.

## Data Plane (Postgres)

- Defined in `base/cnpg/cnpg-cluster.yaml`:
  - `Cluster postgres-cluster` in namespace `postgres-db`.
  - Custom image `ghcr.io/constructive-io/docker/postgres-plus:18`.
  - PgBouncer `Pooler postgres-pooler` for read‑write connections.
- Access pattern:
  - Applications connect via `postgres-cluster-rw.postgres-db.svc.cluster.local:5432` (dev/staging) or `postgres` (local / local-simple overlays).
  - Credentials are provided via `base/cnpg/secret.yaml` and `base/constructive/pg-secret.yaml` (or per-overlay `pg-secret.yaml` for local).

### Observations

- Good separation between data and app namespaces.
- PgBouncer introduces a proper connection‑pooling layer.
- `enableSuperuserAccess` and permissive `pg_hba` entries are acceptable for early dev, but should be hardened for staging/prod. For now staging reuses the same settings; this should be revisited before production.

## App Plane (Constructive API, Explorer, Dashboard)

### Config

- `base/constructive/config.yaml`:
  - `ConfigMap constructive` with:
    - API host/port (`PORT=3000`, `SERVER_HOST=0.0.0.0`, `SERVER_ORIGIN=*`).
    - Database target (`PGHOST=postgres-cluster-rw.postgres-db.svc.cluster.local`).
    - Constructive meta/API settings (schemas, roles, default database id).
  - `ConfigMap dashboard` with Next.js env:
    - GraphQL endpoint, base domains, and DB metadata for the setup flow.

### API + Explorer

- `base/constructive/server.yaml`:
  - `Service constructive-server` (ClusterIP) exposing:
    - Port 3000 → API (`server-http`).
    - Port 3001 → Explorer (`explorer-http`).
  - `Deployment constructive-server` with two containers:
    - `server`: `lql server` on 3000.
    - `explorer`: `lql explorer` on 3001.
  - Both share DB config and credentials.

### Dashboard

- `base/constructive/dashboard.yaml`:
  - `Deployment dashboard` running `ghcr.io/constructive-io/dashboard`.
  - `Service dashboard` exposing port 3000.
  - Reads env from `ConfigMap dashboard`.

### Observations

- Explorer co‑located with API in a single Pod simplifies networking.
- Dashboard separated into its own Deployment + Service, which is clean.
- `ConfigMap dashboard` currently points at a fixed remote API host; this should be made environment‑aware so dev/staging/prod share manifests but differ in overlays.

## Ingress, TLS, and DNS

- Dev ingress/issuer:
  - Defined in `overlays/dev/ingress-*.yaml` and `overlays/dev/ingress-issuer.yaml`.
  - `Issuer constructive-issuer` uses Route53 DNS01 against `launchql.dev`.
  - `Ingress` resources (class `nginx`) route:
    - `*.launchql.dev` → `constructive-server:3000`.
    - `*.explorer.launchql.dev` → `constructive-server:3001`.
    - `*.app.launchql.dev` and `app.launchql.dev` → `dashboard:3000`.
    - `pgadmin.launchql.dev` → `pgadmin:80`.
  - TLS certificate `interweb-constructive-tls` for wildcard hosts.
- Staging ingress:
  - Not yet defined; `overlays/staging` is prepared to add staging‑specific ingress and issuer for a separate domain.
- Local:
  - `overlays/local` intentionally defines no ingress; access is via `kubectl port-forward` or in‑cluster DNS only.

### Observations

- Dev uses three separate ingress resources (API+Explorer, Dashboard, pgAdmin) sharing a wildcard TLS certificate.
- cert-manager + DNS01 provide automated certificates for `launchql.dev`.
- AWS keys and hosted zone identifiers are configured via Kubernetes secrets and the Route53 solver; further hardening (IRSA, external secret managers) is recommended for production.

## Knative Jobs and Functions

### Function workloads

- `base/functions/send-email.yaml`, `base/functions/send-verification-link.yaml`:
  - Knative Service in the overlay's app namespace (`constructive-functions` for `local`, `interweb` for `dev`/`staging`).
  - Runs `node generated/<name>/dist/index.js` from the constructive-functions image.
  - Uses Mailgun credentials from `mailgun-credentials` secret.
  - Autoscaling constrained via Knative annotations.
- For `local-simple`, function workloads are not part of the kustomize tree — Skaffold consumes the per-function manifests under `generated/<name>/k8s/local-deployment.yaml`, regenerated by `pnpm generate`.

### knative-job-service

- `constructive/knative-job-service.yaml`:
  - `Deployment knative-job-service` with:
    - `jobs/knative-job-service/dist/run.js` as the entrypoint.
    - DB config from `constructive` ConfigMap and `pg-credentials` secret.
    - Job configuration:
      - `JOBS_SUPPORT_ANY=false`.
      - `JOBS_SUPPORTED=send-email`.
    - Internal callback URL:
      - `INTERNAL_JOBS_CALLBACK_URL=http://knative-job-service.<namespace>.svc.cluster.local:8080` (namespace varies by overlay).
    - Knative gateway targets:
      - `INTERNAL_GATEWAY_URL` and `INTERNAL_GATEWAY_DEVELOPMENT_MAP` for resolving functions.
  - `Service knative-job-service` (ClusterIP) on port 8080.

### Observations

- Knative is configured for **internal‑only** use:
  - The serving domain is `svc.cluster.local`.
  - Kourier services (`kourier`, `kourier-internal`) are ClusterIPs.
- The job service currently hard‑codes some Knative endpoints (including a revision name), which should be abstracted behind the Knative Route hostnames to allow rolling upgrades.

## Setup & Lifecycle

- `scripts/setup/00-cluster-setup.sh`:
  - Installs cert-manager, ingress-nginx, and optionally monitoring from local operator manifests.
- `scripts/setup/01-install-operators.sh`:
  - Installs CloudNativePG operator.
  - Installs Knative Serving CRDs and core.
  - Installs Kourier and sets `ingress-class` to `kourier.ingress.networking.knative.dev`.
  - Configures Knative domain to `svc.cluster.local` by default.
  - Verifies CRDs and operator pods.
- `scripts/setup/99-cleanup.sh`:
  - Guided teardown of Knative apps, Postgres resources, namespaces, operators, and optional infra (cert-manager, ingress, monitoring).
- `Makefile`:
  - Operator lifecycle: `make setup`, `make teardown`.
  - Data plane: `make install-pg`, `make uninstall-pg`.
  - App plane via Kustomize overlays:
    - `make kustomize-dev`
    - `make kustomize-staging`
    - `make kustomize-local`
  - Local developer shortcuts: port‑forward targets for server, explorer, and dashboard.

For `local-simple` (the recommended laptop path), use `make skaffold-dev` from the repo root instead — Skaffold handles deploy, port-forwarding, and hot reload.

## Strengths

- Clear separation of responsibilities (operators vs data vs app vs functions).
- Internal‑only Knative setup using Kourier and `svc.cluster.local`.
- PgBouncer in front of Postgres for better connection handling.
- Makefile and scripts provide reproducible cluster bring‑up and teardown.
- Reuse of a single Constructive image across API, explorer, jobs, and functions.

## Known Shortcomings / Improvement Areas

- **Environment awareness**
  - `ConfigMap dashboard` and dev ingress hosts are tied to `launchql.dev`.
  - Dev/staging/local overlays exist, but prod overlays are still to be defined.
- **Secrets and security**
  - AWS credentials and Route53 hosted zone IDs are in plain manifests.
  - CNPG cluster enables superuser access with permissive `pg_hba`.
- **Knative routing**
  - `knative-job-service` references specific revision/service hostnames; better to rely on Kourier + Host header and Knative routes.
- **Ingress layout**
  - One Ingress resource configures all HTTP entrypoints (API, explorer, dashboard, pgAdmin), making changes broad in scope.
- **Operator/app coupling**
  - Operator installation and application deployment are tightly coupled in the same Makefile space, whereas operators usually live at a cluster‑admin layer and apps at a tenant/project layer.

## Ideas for Future Improvements

1. **Use env overlays (dev / staging / local / local-simple / ci / prod)**
   - Current layout already uses Kustomize overlays:
     - `overlays/dev` – dev cluster with `interweb` namespace and `launchql.dev` ingress.
     - `overlays/staging` – staging cluster with `interweb` namespace and CNPG backups; ingress still to be defined.
     - `overlays/local` – local cluster using the `constructive-functions` namespace, a single Postgres `Deployment`, a single MinIO `Deployment`, Knative Services for functions, and no ingress.
     - `overlays/local-simple` – same namespace as `local`, but no Knative (plain function Deployments via Skaffold rawYaml) and no CNPG. Default for `make skaffold-dev`.
     - `overlays/ci` – built on top of `local`, scaled down for kind clusters in CI.
   - A future `overlays/prod` can follow the same pattern with hardened settings.
   - Continue to push per‑env differences into overlays:
     - Domains.
     - ConfigMap values (API URLs, flags).
     - Ingress hostnames and TLS.
     - Resource requests/limits and replica counts.

2. **Harden database configuration**
   - Provide production overlays that:
     - Disable superuser access to apps.
     - Restrict `pg_hba` to specific roles and networks.
     - Enable CNPG backup resources for object‑storage snapshots.

3. **Refine Knative job routing**
   - Standardize on calling `kourier-internal.kourier-system.svc.cluster.local` and distributing requests using the `Host` header set to the Knative Service URL (e.g. `send-email.interweb.svc.cluster.local`).
   - Avoid hard‑coding revision names in env vars.

4. **Ingress & secrets hygiene**
   - Split ingress configuration into API/Explorer, Dashboard, and pgAdmin components.
   - Move AWS keys and other external credentials into cluster secrets or external secret managers.

5. **Local‑development variants** *(now in place — see `overlays/local-simple` and `overlays/local`)*
   - `local-simple` — plain Postgres Deployment + plain function Deployments, no operators required. Used by `make skaffold-dev`.
   - `local` — plain Postgres + Knative Services for functions; production parity for the function runtime.
   - A Docker Compose path also exists for the fastest iteration loop (`make dev` + `make dev-fn`); see the root [`DEVELOPMENT.md`](../DEVELOPMENT.md).
