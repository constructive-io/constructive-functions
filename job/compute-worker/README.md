# @constructive-io/compute-worker

Platform-aware job worker that discovers functions and tracks invocations using dynamically-resolved schema/table names from metaschema via `ComputeModuleLoader`.

## How it works

1. Poll `app_jobs.jobs` for the next pending job
2. Lazy-resolve the function definition from DB (TTL-cached, schema resolved from metaschema)
3. Create an invocation record (`status=running`) — scope-aware (platform or org)
4. HTTP POST to the function's `service_url`
5. Update invocation to `completed` or `failed` with duration

## Dynamic schema resolution

Instead of hardcoding schema names, the worker uses `ComputeModuleLoader` to query
`metaschema_modules_public.function_module` and `metaschema_modules_public.function_invocation_module`
at runtime. Schema and table names are TTL-cached per `database_id`.

## Scope-aware invocations

- **Platform scope**: jobs without an `entity_id` — writes to the platform invocation table
- **Org scope**: jobs with an `entity_id` (org UUID) — writes to the org-scoped invocation table with `owner_id`

## Key differences from knative-job-worker

| Feature | knative-job-worker | compute-worker |
|---------|-------------------|----------------|
| Function discovery | Static manifest / env vars | Database query (cached, schema from metaschema) |
| Invocation tracking | None | Scope-aware invocation tables |
| Task filtering | `JOBS_SUPPORTED` env var | Accepts any registered task |
| URL resolution | Gateway URL + dev map | `service_url` from DB definition |
| Schema resolution | N/A | Dynamic via ComputeModuleLoader |
