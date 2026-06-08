# @constructive-io/compute-service

Platform-aware job service orchestrator. Mirrors `knative-job-service` but uses `ComputeWorker` for database-driven function discovery and invocation tracking.

## What it starts

1. HTTP callback server for job completion notifications
2. `ComputeWorker` — polls jobs and dispatches to functions discovered from the database
3. `Scheduler` — handles cron-like scheduled jobs
4. (Optional) In-process function servers from the manifest

## Usage

```bash
# As a standalone process
node job/compute-service/dist/run.js

# Via the dev script (starts compute-service + all functions)
make dev-compute
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `COMPUTE_JOBS_ENABLED` | `true` | Enable/disable the compute worker |
| `JOBS_SCHEMA` | `app_jobs` | PostgreSQL schema for the jobs table |
| `INTERNAL_JOBS_CALLBACK_PORT` | `8080` | Port for the callback HTTP server |
| `COMPUTE_CALLBACK_URL` | — | URL functions POST to on completion |
| `COMPUTE_GATEWAY_URL` | — | Fallback gateway URL for functions without `service_url` |
