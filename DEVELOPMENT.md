# Development Guide

Local development setup for running functions against real infrastructure (Postgres, GraphQL, Mailpit).

## Prerequisites

- Node.js >= 18.17.0
- pnpm >= 10
- Docker Desktop

Check what's installed and what's missing:

```bash
make setup-check
```

Install all missing tools (kubectl, skaffold, pnpm):

```bash
make setup-dev
```

## Quick Start

```bash
# 1. Generate workspace packages from function templates
pnpm generate

# 2. Install dependencies
pnpm install

# 3. Build everything (packages, job service, generated functions)
pnpm build

# 4. Start infrastructure (Postgres, DB migrations, GraphQL server, Mailpit)
make dev

# 5. Wait for db-setup to finish (watch logs)
make dev-logs

# 6. Start functions as local Node processes
make dev-fn
```

## Step-by-Step

### 1. Generate + Build

The generate step reads `functions/*/handler.json` manifests, resolves templates from `templates/node-graphql/`, and produces full workspace packages in `generated/`.

```bash
pnpm generate          # Generate all functions
pnpm install           # Install dependencies (including generated packages)
pnpm build             # Build all workspace packages
```

After this you should have built artifacts in:

| Package | Output |
|---------|--------|
| `generated/send-email-link/dist/` | Send-email-link function server |
| `generated/simple-email/dist/` | Simple-email function server |
| `generated/example/dist/` | Example function server |
| `job/service/dist/` | Knative job service (worker + scheduler) |
| `packages/fn-runtime/dist/` | Function runtime library |
| `packages/fn-app/dist/` | Function app framework |

### 2. Start Infrastructure

```bash
make dev
```

This runs `docker compose up -d` which starts:

| Service | Description | Port |
|---------|-------------|------|
| **postgres** | PostgreSQL 16 with pgvector + PostGIS | 5432 |
| **db-setup** | One-shot: creates DB, bootstraps roles, deploys pgpm packages | (exits on completion) |
| **graphql-server** | Constructive admin GraphQL API (header-based routing) | 3002 |
| **mailpit** | SMTP capture server with web UI | 1025 (SMTP), 8025 (UI) |

The `db-setup` container must finish before `graphql-server` starts (enforced by `service_completed_successfully`). Watch progress:

```bash
make dev-logs
# or
docker compose logs -f db-setup
```

Verify everything is running:

```bash
docker compose ps
```

You should see:
- `postgres` — running (healthy)
- `db-setup` — exited (0)
- `graphql-server` — running
- `mailpit` — running

### 3. Start Functions Locally

```bash
make dev-fn
```

This runs `scripts/dev.ts` which spawns local Node processes with env vars pointing to Docker services:

| Process | Port | Script |
|---------|------|--------|
| **job-service** | 8080 | `job/service/dist/run.js` |
| **simple-email** | 8081 | `generated/simple-email/dist/index.js` |
| **send-email-link** | 8082 | `generated/send-email-link/dist/index.js` |

To start a single function:

```bash
pnpm dev:fn -- --only=send-email-link
```

### 4. Test a Function

Send a request to `send-email-link`:

```bash
curl -X POST http://localhost:8082 \
  -H 'Content-Type: application/json' \
  -H 'X-Database-Id: constructive' \
  -d '{"email_type":"invite_email","email":"test@example.com"}'
```

Check captured emails at http://localhost:8025 (Mailpit UI).

Query the GraphQL API directly:

```bash
curl http://localhost:3002/graphql \
  -H 'Content-Type: application/json' \
  -H 'X-Database-Id: constructive' \
  -d '{"query":"{ __typename }"}'
```

### 5. Shut Down

```bash
make dev-down          # Stop Docker infrastructure
```

`Ctrl+C` in the `make dev-fn` terminal stops the local function processes.

## Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm generate` | Generate workspace packages from function templates |
| `pnpm build` | Build all workspace packages |
| `make dev` | Start Docker infrastructure |
| `make dev-fn` | Start functions as local Node processes |
| `make dev-down` | Stop Docker infrastructure |
| `make dev-logs` | Follow Docker service logs |
| `pnpm test` | Run all tests |
| `pnpm test:unit` | Run unit tests only (`functions/*/__tests__/`) |
| `pnpm test:integration` | Run integration tests only (`tests/integration/`) |

## Port Map

| Service | Port |
|---------|------|
| PostgreSQL | 5432 |
| GraphQL API | 3002 |
| Mailpit SMTP | 1025 |
| Mailpit UI | 8025 |
| Job Service | 8080 |
| simple-email | 8081 |
| send-email-link | 8082 |

## Architecture

```
Docker Compose (infrastructure):
  postgres -> db-setup (migrations) -> graphql-server
                                       mailpit

Local Node processes (functions):
  job/service/dist/run.js                        (port 8080)
  generated/simple-email/dist/index.js           (port 8081)
  generated/send-email-link/dist/index.js        (port 8082)
```

Infrastructure runs in Docker. Functions run as local Node processes from `generated/` — no Docker rebuild needed when function code changes. Edit `functions/*/handler.ts`, rebuild (`pnpm build`), restart `make dev-fn`.

## GHCR Authentication

Several container images are hosted on GitHub Container Registry (`ghcr.io/constructive-io/`). You need a GitHub Personal Access Token (PAT) with `read:packages` scope to pull them.

### Docker login (for local builds and Docker Compose)

```bash
echo $GH_PAT_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

### Kubernetes pull secret (for Skaffold / k8s dev)

The `constructive-functions` namespace needs a `ghcr-pull` secret so k8s nodes can pull private GHCR images:

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

### CI (GitHub Actions)

Set these repository secrets: `GH_USERNAME`, `GH_PAT_TOKEN`, `GH_EMAIL`. The `test-k8s-deployment.yaml` workflow uses them to create the pull secret in CI.

## K8s Local Development (Skaffold)

Run the entire stack in Kubernetes with hot-reload for handler code changes. All resources deploy to the `constructive-functions` namespace.

### Prerequisites

- A local k8s cluster (Docker Desktop, k3d, kind — `kubectl get nodes` should work)
- [Skaffold](https://skaffold.dev/docs/install/) CLI installed
- GHCR pull secret set up (see above)
- For Knative mode: `cd k8s && make operators-knative-only`

### Option A: Plain k8s (no Knative)

Uses plain Deployments + Services. No operators needed beyond stock k8s.

```bash
make skaffold-dev
```

This runs `skaffold dev -p local-simple` which:
1. Builds the `constructive-functions` Docker image from `Dockerfile.dev`
2. Deploys infrastructure (postgres, minio, constructive-server, constructive-server-admin, db-setup, job-service) via kustomize
3. Deploys functions (simple-email, send-email-link) via generated rawYaml manifests
4. Sets up port-forwarding automatically
5. Watches `functions/**/*.ts` — edits are synced into running containers
6. `tsx --watch` inside each function container detects changes and restarts

### Option B: Knative

Uses Knative Serving for functions (production parity). Requires Knative + Kourier.

```bash
# One-time setup
cd k8s && make operators-knative-only && cd ..

# Start dev loop
make skaffold-dev-knative
```

### Hot Reload

Handler code changes are hot-reloaded without rebuilding the Docker image:

1. Edit `functions/<name>/handler.ts`
2. Skaffold detects the change and syncs the file into the running container
3. `tsx --watch` picks up the change and restarts the process (~2-5 seconds)

Changes to runtime packages (`packages/fn-runtime`, `packages/fn-app`) or `package.json` trigger a full image rebuild (Skaffold handles this automatically).

### Port Map (Skaffold)

| Service | Local Port |
|---------|------------|
| simple-email | 8081 |
| send-email-link | 8082 |
| Job Service | 8080 |
| PostgreSQL | 5432 |
| Constructive Server | 3002 |

### Skaffold Commands Reference

| Command | Description |
|---------|-------------|
| `make skaffold-dev` | Start plain k8s dev loop |
| `make skaffold-dev-knative` | Start Knative dev loop |
| `skaffold build -p local-simple` | Build image only (no deploy) |
| `skaffold delete -p local-simple` | Delete deployed resources |

## Adding a New Function

1. **Create the function source:**

   ```bash
   mkdir functions/my-function
   ```

   Add `functions/my-function/handler.json`:
   ```json
   {
     "name": "my-function",
     "version": "1.0.0",
     "type": "node-graphql",
     "description": "What this function does",
     "dependencies": {}
   }
   ```

   Add `functions/my-function/handler.ts` with your function logic.

2. **Generate the workspace package:**

   ```bash
   pnpm generate
   pnpm install
   ```

   This creates `generated/my-function/` with the full package, Dockerfile, and k8s manifests (including `k8s/local-deployment.yaml`).

3. **Register in Skaffold** — edit `skaffold.yaml`, add to the `local-simple` profile:

   ```yaml
   rawYaml:
     - generated/simple-email/k8s/local-deployment.yaml
     - generated/send-email-link/k8s/local-deployment.yaml
     - generated/my-function/k8s/local-deployment.yaml  # <- add this
   ```

   And add a port-forward entry:
   ```yaml
   portForward:
     - resourceType: service
       resourceName: my-function
       namespace: constructive-functions
       port: 80
       localPort: 8083  # pick an unused port
   ```

4. **Register in job-service** — edit `k8s/overlays/local-simple/job-service.yaml`, add to `JOBS_SUPPORTED` and `INTERNAL_GATEWAY_DEVELOPMENT_MAP`.

5. **Test:**

   ```bash
   make skaffold-dev        # deploy
   pnpm test:e2e            # run e2e tests
   ```

## E2E Tests

E2E tests run against the live k8s stack. They insert jobs into the database via SQL and verify the job-service dispatches them to functions.

### Running locally

Requires Skaffold running or manual port-forwards active:

```bash
pnpm test:e2e
```

With explicit env vars:

```bash
PGHOST=localhost PGPORT=5432 PGUSER=postgres PGPASSWORD='postgres123!' PGDATABASE=constructive pnpm test:e2e
```

### What's tested

- **job-queue**: SQL schema verification, `app_jobs.add_job`, job retrieval
- **job-processing**: Full pipeline — insert job → job-service dispatches → function processes → job completes

### CI

E2E tests run automatically in the `CI Test K8s` workflow (`.github/workflows/test-k8s-deployment.yaml`) on PRs and pushes that modify `k8s/`, `tests/e2e/`, or `functions/`.

## Troubleshooting

**Pods show `ImagePullBackOff`**

GHCR pull secret is missing or expired. See [GHCR Authentication](#ghcr-authentication) above.

**db-setup fails or graphql-server won't start**

Check if the GHCR image is accessible:

```bash
docker pull ghcr.io/constructive-io/constructive:latest
```

**Port already in use**

Stop any existing services using the ports:

```bash
make dev-down
lsof -ti:5432,3002,1025,8025,8080,8081,8082 | xargs kill -9
```

**Functions can't connect to GraphQL**

Ensure infrastructure is fully up before starting functions:

```bash
docker compose ps    # db-setup should show "Exited (0)", graphql-server should be "running"
curl http://localhost:3002/graphql -H 'Content-Type: application/json' -d '{"query":"{ __typename }"}'
```

**Stale build artifacts**

Clean and rebuild from scratch:

```bash
pnpm clean
pnpm generate
pnpm install
pnpm build
```
