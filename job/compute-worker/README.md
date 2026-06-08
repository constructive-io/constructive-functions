# @constructive-io/compute-worker

Platform-aware job worker that discovers functions from the database (`constructive_infra_public.platform_function_definitions`) and tracks invocations in `platform_function_invocations`.

## How it works

1. Poll `app_jobs.jobs` for the next pending job
2. Lazy-resolve the function definition from DB (TTL-cached)
3. Create an invocation record (`status=running`)
4. HTTP POST to the function's `service_url`
5. Update invocation to `completed` or `failed` with duration

## Key differences from knative-job-worker

| Feature | knative-job-worker | compute-worker |
|---------|-------------------|----------------|
| Function discovery | Static manifest / env vars | Database query (cached) |
| Invocation tracking | None | `platform_function_invocations` table |
| Task filtering | `JOBS_SUPPORTED` env var | Accepts any registered task |
| URL resolution | Gateway URL + dev map | `service_url` from DB definition |
