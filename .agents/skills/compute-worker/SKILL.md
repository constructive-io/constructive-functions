---
name: compute-worker
description: Platform-aware compute worker and service for constructive-functions. Discovers functions from the database, tracks invocations, dispatches via HTTP. Use when working on the compute-worker, compute-service, function discovery, or invocation tracking.
---

# Compute Worker & Service

The compute-worker is a platform-aware replacement for the legacy knative-job-worker. Instead of discovering functions from a static manifest or env vars, it queries `constructive_infra_public.platform_function_definitions` and tracks every invocation in `platform_function_invocations`.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ compute-service (orchestrator)                          │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ HTTP callback │  │ ComputeWorker│  │  Scheduler   │  │
│  │ server (:8080)│  │ (polls jobs) │  │ (cron jobs)  │  │
│  └──────────────┘  └──────┬───────┘  └──────────────┘  │
│                           │                              │
│            ┌──────────────┼──────────────┐               │
│            │              │              │               │
│            ▼              ▼              ▼               │
│    FunctionDiscovery  InvocationTracker  compute_request │
│    (TTL-cached DB     (INSERT/UPDATE    (HTTP POST to   │
│     lookups)          invocations)      function URL)   │
└─────────────────────────────────────────────────────────┘
         │                    │                │
         ▼                    ▼                ▼
  platform_function    platform_function    Function HTTP
  _definitions         _invocations        endpoint
  (read)               (write)             (send-email:8081)
```

## Packages

### job/compute-worker (`@constructive-io/compute-worker`)

Core worker class and supporting modules:

| File | Purpose |
|------|---------|
| `src/index.ts` | `ComputeWorker` class — lifecycle, job polling, dispatch |
| `src/discovery.ts` | `FunctionDiscovery` — lazy TTL-cached DB lookups |
| `src/invocation.ts` | `InvocationTracker` — create/complete/fail invocation records |
| `src/req.ts` | `compute_request()` — HTTP POST dispatch with X-* headers |
| `src/cache.ts` | `TtlCache<T>` — generic TTL cache |
| `src/types.ts` | TypeScript interfaces |

### job/compute-service (`@constructive-io/compute-service`)

Orchestrator that starts the callback server, ComputeWorker, and Scheduler:

| File | Purpose |
|------|---------|
| `src/index.ts` | `ComputeService` class + `bootCompute()` entry point |
| `src/run.ts` | CLI entry point (`node dist/run.js`) |
| `src/registry.ts` | Function registry loader (for optional in-process function servers) |
| `src/types.ts` | TypeScript interfaces |

## Key differences from legacy worker

| Feature | knative-job-worker | compute-worker |
|---------|-------------------|----------------|
| Function discovery | Static manifest / `JOBS_SUPPORTED` env | DB query (TTL-cached) |
| Invocation tracking | None | `platform_function_invocations` table |
| Task filtering | `JOBS_SUPPORTED` allowlist | Accepts any registered task |
| URL resolution | Gateway URL + dev map | `service_url` from DB → dev map → gateway fallback |
| Infra requirement | Only needs `app_jobs` schema | Needs `app_jobs` + `constructive_infra_public` |

## Function discovery flow

```
Job arrives (task_identifier = "send-email")
  │
  ▼
FunctionDiscovery.resolve("send-email")
  │
  ├─ Cache hit? → return cached definition
  │
  └─ Cache miss? → SQL query:
       SELECT * FROM constructive_infra_public.platform_function_definitions
       WHERE task_identifier = 'send-email'
       │
       └─ Cache result (TTL default: 60s)
          │
          ▼
     PlatformFunctionDefinition {
       id, name, task_identifier, service_url,
       is_invocable, max_attempts, priority, ...
     }
```

## Invocation lifecycle

```
1. create() → INSERT INTO platform_function_invocations
              (status='running', started_at=now())
              → returns invocation_id

2a. complete() → UPDATE SET status='completed',
                 completed_at=now(), duration_ms=X

2b. fail()     → UPDATE SET status='failed',
                 completed_at=now(), duration_ms=X, error='...'
```

## Running locally

```bash
# Tier 1: pgpm-local
pgpm docker start --image docker.io/constructiveio/postgres-plus:18
eval "$(pgpm env)"
make setup-platform    # deploy infra + seed functions
make dev-compute       # start compute-service + functions

# Tier 2: compose-local
make dev               # docker compose up
make dev-compute       # start compute-service + functions
```

## Testing a job manually

```bash
# Insert a test job
eval "$(pgpm env)"
psql -d constructive-functions-db1 -c "
  INSERT INTO app_jobs.jobs (task_identifier, payload)
  VALUES ('send-email', '{\"to\":\"test@example.com\",\"subject\":\"test\",\"html\":\"<p>hi</p>\"}'::json)
"

# Check invocation records
psql -d constructive-functions-db1 -c "
  SELECT id, task_identifier, status, duration_ms, error
  FROM constructive_infra_public.platform_function_invocations
  ORDER BY started_at DESC LIMIT 5
"
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `COMPUTE_JOBS_ENABLED` | `true` | Enable/disable the compute worker |
| `COMPUTE_CALLBACK_URL` | — | URL functions POST to on completion |
| `COMPUTE_GATEWAY_URL` | — | Fallback gateway URL for functions without `service_url` |
| `JOBS_SCHEMA` | `app_jobs` | PostgreSQL schema for the jobs table |
| `INTERNAL_JOBS_CALLBACK_PORT` | `8080` | Port for the HTTP callback server |
| `INTERNAL_GATEWAY_DEVELOPMENT_MAP` | — | JSON map of task→URL for local dev |

## Database requirements

The compute-service checks two things at boot:
1. `app_jobs.jobs` table exists (deployed by `@pgpm/database-jobs`, a dependency of `constructive-infra`)
2. `constructive_infra_public.platform_function_definitions` table exists (deployed by `constructive-infra`)

Both are deployed together via `make setup-platform` or the `platform-setup` Docker Compose service.
