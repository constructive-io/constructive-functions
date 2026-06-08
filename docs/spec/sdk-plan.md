# constructive-functions `sdk/` plan

How `constructive` and `constructive-db` structure their `sdk/` folders, and what
`constructive-functions` should do.

## 1. How the two reference repos do it

Both repos generate typed clients from **PostGraphile-exported GraphQL SDL** using a
single shared toolchain:

- `@constructive-io/graphql-codegen` — `expandSchemaDirToMultiTarget()` + `generateMulti()`
- `makage` build (cjs `dist/` + esm `esm/`), `tsx` generate scripts
- `docs: { skills: true }` auto-emits the `.agents/skills/{orm,cli,hooks}-*` skills

The only real difference is **where the SDL comes from**.

### Pattern A — `constructive-db/sdk` (schema-export is its own package)

| package | name | role |
|---|---|---|
| `constructive-schema` | `@constructive-db/constructive-schema` | **source of truth.** Deploys the pgpm module (`application/app`) to an ephemeral DB, introspects via `graphile-schema` `buildSchemaSDL`, writes per-target `.graphql` + introspection JSON. 8 targets (api, modules, auth, admin, usage, agent, objects, migrate). |
| `sdk` | `@constructive-db/sdk` | multi-target ORM generated from `../constructive-schema/schemas` |
| `constructive-sdk` | `@constructive-db/constructive-sdk` | standalone ORM variant |
| `constructive-cli` | `@constructive-db/constructive-cli` | typed multi-target CLI from the same schemas |

Schema is **regenerated from the DB**, never hand-edited. This fits because the repo
owns the pgpm modules that define the schema.

### Pattern B — `constructive/sdk` (schemas committed in-repo)

| package | name | role |
|---|---|---|
| `constructive-sdk` | `@constructive-io/sdk` | holds committed `schemas/*.graphql` + generates ORM; also drives migrate-client |
| `constructive-react` | `@constructive-io/react` | React Query hooks (`@tanstack/react-query`) |
| `constructive-cli` | `@constructive-sdk/cli` | CLI (+ ollama / yanse extras) |
| `migrate-client` | `@pgpmjs/migrate-client` | single-target ORM (db_migrate) |

Same codegen, but SDL files are committed rather than regenerated each run.

## 2. Where constructive-functions is today

- **No `sdk/` folder.** pnpm-workspace = `generated/*`, `packages/*`, `job/*`, `www`.
- Owns its DB schema via pgpm modules `constructive-infra`, `-infra-seed`, `-infra-services`:
  - `constructive_infra_public` — `platform_function_definitions`,
    `platform_function_invocations`, `platform_function_execution_logs`,
    `platform_secret_definitions`, `platform_namespaces`, `platform_namespace_events`
  - `constructive_infra_private`
- These tables are **NOT exposed via GraphQL** anywhere. The `graphql-server` in
  docker-compose only exposes `metaschema_public,services_public,constructive_auth_public`.
- `www/server/index.ts` reads the infra tables with **raw `pg.Pool` SQL**.
- `packages/fn-runtime` calls an **external tenant** Constructive GraphQL API via
  hand-written `graphql-request` queries (it is a *consumer* of constructive's API).

## 3. Two distinct SDK concerns (don't conflate)

### (A) Inbound admin SDK — the actual `sdk/` folder
A typed ORM (+ React Query hooks) over `constructive_infra_public`, so `www` and the
job service stop hand-writing SQL. This is the direct analog of what `constructive-db`
and `constructive` generate for their own schemas.

**Prerequisite:** expose `constructive_infra_public` (and an admin view of `_private`)
through the existing PostGraphile `graphql-server` — i.e. add it to `API_EXPOSED_SCHEMAS`.
Without an SDL there is nothing to codegen from.

### (B) Outbound runtime SDK — fn-runtime calling the tenant API
Replace fn-runtime's hand-written `graphql-request` calls with the published
`@constructive-io/sdk` ORM. Separate effort, lower priority, no new package in this repo.

## 4. Recommended plan

**Mirror `constructive-db`'s Pattern A** — keep schema export separate from codegen,
because functions owns its pgpm modules exactly like constructive-db owns `application/app`.

1. **Expose the schema.** Add `constructive_infra_public` to the graphql-server's
   `API_EXPOSED_SCHEMAS` (+ admin meta for `_private`). Decide platform vs admin targets.
2. **`sdk/constructive-schema`** (`@constructive-functions/constructive-schema`):
   deploy `pgpm/constructive-infra*` to an ephemeral DB → export `infra.graphql`
   (+ `admin.graphql` if split) + introspection JSON. Copy
   `constructive-db/sdk/constructive-schema/scripts/generate-schemas.ts` and point
   `MODULE_PATH` at the functions pgpm module(s).
3. **`sdk/constructive-sdk`** (`@constructive-functions/sdk`): `generateMulti` over the
   exported schemas → typed ORM + `docs.skills`.
4. **`sdk/constructive-react`** (`@constructive-functions/react`): React Query hooks —
   highest-value consumer is `www`, which is already React.
5. **`sdk/constructive-cli`** (optional): typed CLI for ops/scripts.
6. **Wire workspace + generate step:** add `sdk/*` to `pnpm-workspace.yaml`; add a
   `generate:sdk` script (schema → sdk → react/cli) alongside the existing root `generate`.
7. **Migrate `www`** off raw `pg` onto the generated ORM/hooks incrementally.

### Future target: the flow-graph / merkle `graph_module`
When the merkle `graph_module` (flow-graph persistence we scoped in `fbp-data-model.md`)
is provisioned in this repo, its `function_graphs` / `function_graph_executions` tables
become **another codegen target** in the same `sdk/constructive-schema` export — giving
the Flows UI a typed client for save/load/execute instead of localStorage.

## 5. Open questions
1. Single `infra` target, or split `infra` (platform) vs `admin` (privileged)?
2. Publish scope/names — `@constructive-functions/*`? These are currently `private`.
3. Do we want React hooks now (www is the only consumer) or ORM-only first?
4. Stand up PostGraphile over infra schemas in dev (docker-compose) before codegen, or
   commit SDL (Pattern B) to avoid a live DB dependency in CI?
