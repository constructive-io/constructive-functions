# @constructive-io/functions-schema

Exported GraphQL SDL for the constructive-functions infra schemas.

This package deploys the `pgpm/constructive-infra` module to an **ephemeral**
PostgreSQL database, introspects it through PostGraphile (via `graphile-schema`),
and writes one `.graphql` SDL file per API target into `schemas/`. Those SDL
files are the input for ORM codegen in `@constructive-io/functions-sdk`.

## Targets

| Target | Postgres schema(s) |
| ------ | ------------------ |
| `infra` | `constructive_infra_public` |

## Generate

Requires a running PostgreSQL 18 (`pgpm docker start --image docker.io/constructiveio/postgres-plus:18`)
and `eval "$(pgpm env)"` so the ephemeral DB can be created.

```bash
pnpm --filter @constructive-io/functions-schema run generate
# optional: per-table introspection JSON
pnpm --filter @constructive-io/functions-schema run generate:introspection
```

## Generated (do not edit)

- `schemas/*.graphql`
- `src/index.ts`
- `introspection/*.json`

Edit the pgpm source under `pgpm/constructive-infra`, then regenerate.
