# E2E Tests

End-to-end tests that run against a live Kubernetes stack. These tests expect the full system to be running — either via Skaffold or a manually deployed local k8s cluster.

## Prerequisites

All of the following must be running and accessible:

- **PostgreSQL** — port-forwarded to `localhost:5432`
- **constructive-server** — the GraphQL API server
- **knative-job-service** — the job worker that picks up and dispatches jobs
- **simple-email** / **send-email-link** — the function deployments
- **Database seeded** — `constructive-db` job must have completed (schemas + pgpm packages deployed)

The simplest way to get everything running:

```bash
make skaffold-dev
```

Or if Skaffold isn't managing port-forwards, set them up manually:

```bash
kubectl port-forward -n constructive-functions svc/postgres 5432:5432
```

## Running

```bash
pnpm test:e2e
```

With explicit env vars (if not using defaults):

```bash
PGHOST=localhost PGPORT=5432 PGUSER=postgres PGPASSWORD='postgres123!' PGDATABASE=constructive pnpm test:e2e
```

## What's tested

- **job-queue** — SQL-level tests: schema verification, `app_jobs.add_job`, job retrieval
- **job-processing** — Full pipeline: insert a job → job-service picks it up → function processes it → job completes/fails
