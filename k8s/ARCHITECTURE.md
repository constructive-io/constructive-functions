# Interweb / Constructive Kubernetes Architecture

This document summarizes the current Kubernetes layout under `interweb/k8s`, highlights strengths and shortcomings, and sketches directions for improvement and local‑development variants.

## High‑Level Overview

- **Cluster operators**
  - CloudNativePG (CNPG) operator for Postgres.
  - Knative Serving + Kourier for internal HTTP functions.
  - cert-manager + ingress-nginx for TLS and HTTP ingress.
- **Namespaces**
  - `postgres-db`: CloudNativePG `Cluster` + PgBouncer `Pooler`.
  - App namespaces are overlay‑specific:
    - `interweb` (dev and local).
    - `interweb-staging` (staging).

- **Workloads**
  - `postgres-cluster` (CNPG) with PgBouncer `postgres-pooler`.
  - `constructive-server` (API + Explorer sidecar).
  - `dashboard` (Next.js UI).
  - `pgadmin` (DB admin UI).
  - `knative-job-service` (internal job orchestration for functions).
  - Knative Services `simple-email` and `send-email-link` (email functions).

The `Makefile` in `interweb/k8s` wires this together via `install-pg` / `uninstall-pg`, `kustomize-dev`, `kustomize-staging`, and `kustomize-local`, plus helper targets.

## Data Plane (Postgres)

- Defined in `base/cnpg/cnpg-cluster.yaml`:
  - `Cluster postgres-cluster` in namespace `postgres-db`.
  - Custom image `ghcr.io/launchql/pgvector-postgis:16.10`.
  - PgBouncer `Pooler postgres-pooler` for read‑write connections.
- Access pattern:
  - Applications connect via `postgres-cluster-rw.postgres-db.svc.cluster.local:5432` (dev/staging) or `postgres` (local overlay).
  - Credentials are provided via `base/cnpg/secret.yaml` and `base/constructive/pg-secret.yaml`.

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
    - LaunchQL meta/API settings (schemas, roles, default database id).
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

### simple-email function

- `functions/simple-email.yaml`:
  - Knative Service `simple-email` in namespace `interweb`.
  - Runs `node functions/simple-email/dist/index.js` from the LaunchQL image.
  - Uses Mailgun credentials from `mailgun-credentials` secret.
  - Autoscaling constrained via Knative annotations.

### knative-job-service

- `constructive/knative-job-service.yaml`:
  - `Deployment knative-job-service` with:
    - `jobs/knative-job-service/dist/run.js` as the entrypoint.
    - DB config from `constructive` ConfigMap and `pg-credentials` secret.
    - Job configuration:
      - `JOBS_SUPPORT_ANY=false`.
      - `JOBS_SUPPORTED=simple-email`.
    - Internal callback URL:
      - `INTERNAL_JOBS_CALLBACK_URL=http://knative-job-service.interweb.svc.cluster.local:8080`.
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

## Strengths

- Clear separation of responsibilities (operators vs data vs app vs functions).
- Internal‑only Knative setup using Kourier and `svc.cluster.local`.
- PgBouncer in front of Postgres for better connection handling.
- Makefile and scripts provide reproducible cluster bring‑up and teardown.
- Reuse of a single LaunchQL image across API, explorer, jobs, and functions.

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

1. **Use env overlays (dev / staging / local / prod)**
   - Current layout already uses Kustomize overlays:
     - `overlays/dev` – dev cluster with `interweb` namespace and `launchql.dev` ingress.
     - `overlays/staging` – staging cluster with `interweb-staging` namespace and CNPG backups; ingress still to be defined.
     - `overlays/local` – local cluster using the `interweb` namespace, a single Postgres `Deployment`, a single MinIO `Deployment`, and no ingress.
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
   - Standardize on calling `kourier-internal.kourier-system.svc.cluster.local` and distributing requests using the `Host` header set to the Knative Service URL (e.g. `simple-email.interweb.svc.cluster.local`).
   - Avoid hard‑coding revision names in env vars.

4. **Ingress & secrets hygiene**
   - Split ingress configuration into API/Explorer, Dashboard, and pgAdmin components.
   - Move AWS keys and other external credentials into cluster secrets or external secret managers.

5. **Local‑development variants**
   - Provide an alternative “local” profile that:
     - Replaces CNPG operator + cluster with a single Postgres Deployment + Service.
     - Optionally disables Knative and runs functions as simple Deployments/Services or Docker‑compose services.
     - Uses smaller resource requests to run comfortably on a laptop.

The next step is to complement this document with concrete manifests for a local‑development topology (either via docker‑compose or a lightweight local Kubernetes setup) that share the same core LaunchQL/Constructive image and config but run without CNPG/Knative operators.
