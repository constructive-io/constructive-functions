---
name: dev-tiers
description: Three-tier local development environment for constructive-functions. Covers pgpm-local (Tier 1), compose-local (Tier 2), and k8s-local (Tier 3). Use when setting up the dev environment, starting services, or debugging infrastructure.
---

# Development Tiers

constructive-functions supports three tiers of local development, each adding more infrastructure while keeping the same function code. Choose based on what you need.

## Tier 1 — pgpm-local

**What it is:** Postgres only via `pgpm docker`. Functions + services run as bare Node.js processes on the host. Fastest edit-run cycle.

**When to use:** Day-to-day function development, quick iteration, debugging a single function.

**Setup:**
```bash
# Start Postgres
pgpm docker start --image docker.io/constructiveio/postgres-plus:18
eval "$(pgpm env)"

# Deploy infra schema + seed function definitions
make setup-platform

# Generate function packages (if not done)
pnpm generate && pnpm install && pnpm build

# Start functions + compute-service (platform-aware)
make dev-compute

# Or start functions + legacy job-service
make dev-fn
```

**What runs where:**
| Component | Where |
|-----------|-------|
| PostgreSQL | Docker container (via pgpm) |
| MinIO (optional) | Docker container (via pgpm) |
| Functions (send-email, etc.) | Local Node.js process |
| compute-service / job-service | Local Node.js process |
| GraphQL server | Not running (unless started manually) |

**Database:** `constructive-functions-db1` (configurable via `DB_NAME` env var)

**Ports:**
| Service | Port |
|---------|------|
| PostgreSQL | 5432 |
| compute-service / job-service | 8080 |
| send-email | 8081 |
| send-verification-link | 8082 |

---

## Tier 2 — compose-local

**What it is:** Docker Compose runs infrastructure (Postgres, db-setup, GraphQL server, mailpit, platform-setup). Functions still run as local Node.js processes.

**When to use:** Testing with full infrastructure, working with email, needing GraphQL API, integration testing.

**Setup:**
```bash
# Create .env from example
cp .env.example .env

# Start infrastructure
make dev                     # docker compose up -d

# Wait for db-setup + platform-setup to complete
docker compose logs -f db-setup platform-setup

# Start functions + compute-service
make dev-compute

# Or start functions + legacy job-service
make dev-fn
```

**What runs where:**
| Component | Where |
|-----------|-------|
| PostgreSQL | Docker container |
| db-setup (deploys constructive, metaschema) | Docker container (runs once) |
| platform-setup (deploys constructive-infra, seeds functions) | Docker container (runs once) |
| GraphQL server | Docker container (port 3002) |
| Mailpit (email testing) | Docker container (SMTP 1025, UI 8025) |
| Functions | Local Node.js process |
| compute-service / job-service | Local Node.js process |

**Database:** `constructive` (full constructive stack)

**Ports:**
| Service | Port |
|---------|------|
| PostgreSQL | 5432 |
| GraphQL server | 3002 |
| Mailpit SMTP | 1025 |
| Mailpit UI | 8025 |
| compute-service / job-service | 8080 |
| send-email | 8081 |
| send-verification-link | 8082 |

---

## Tier 3 — k8s-local

**What it is:** Everything runs in a local Kubernetes cluster via Skaffold. Two sub-profiles: `local-simple` (plain Deployments) and `local` (Knative Serving).

**When to use:** Testing K8s manifests, verifying production-like behavior, testing Knative scaling, pre-deployment validation.

**Setup (local-simple — no Knative):**
```bash
# One-time: install K8s tooling
make setup-dev

# Start everything
make skaffold-dev
```

**Setup (local — Knative):**
```bash
# One-time: install Knative operators
cd k8s && make operators-knative-only

# Start everything
make skaffold-dev-knative
```

**What runs where:**
| Component | Where |
|-----------|-------|
| Everything | Kubernetes pods |

**Key manifests (local-simple overlay):**
- `k8s/overlays/local-simple/postgres-local.yaml` — PostgreSQL StatefulSet
- `k8s/overlays/local-simple/constructive-db-job.yaml` — DB setup Job
- `k8s/overlays/local-simple/job-service.yaml` — Legacy job service Deployment
- `k8s/overlays/local-simple/compute-service.yaml` — Platform-aware compute service Deployment
- `k8s/overlays/local-simple/constructive-server.yaml` — GraphQL server

---

## Switching between tiers

The tiers are independent. Tear down one before starting another to avoid port conflicts:

```bash
# Stop Tier 2
make dev-down

# Stop Tier 3
# Ctrl+C in the skaffold terminal

# Stop Tier 1
pgpm docker stop
```

## Environment variables

Common env vars across all tiers:

| Variable | Tier 1 Default | Tier 2 Default | Description |
|----------|---------------|---------------|-------------|
| `PGHOST` | localhost | localhost | PostgreSQL host |
| `PGPORT` | 5432 | 5432 | PostgreSQL port |
| `PGUSER` | postgres | postgres | PostgreSQL user |
| `PGPASSWORD` | (from pgpm env) | (from .env) | PostgreSQL password |
| `PGDATABASE` | constructive-functions-db1 | constructive | Database name |
| `JOBS_SCHEMA` | app_jobs | app_jobs | Jobs table schema |
| `COMPUTE_JOBS_ENABLED` | true | true | Enable compute worker |
