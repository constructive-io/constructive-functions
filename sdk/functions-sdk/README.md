# @constructive-io/functions-sdk

Typed GraphQL ORM client for the constructive-functions infra schemas.

Generated from the SDL exported by `@constructive-io/functions-schema` using
`@constructive-io/graphql-codegen`. One ORM target is produced per `.graphql`
file (currently `infra`).

## Generate

```bash
# 1. export SDL from the pgpm module
pnpm --filter @constructive-io/functions-schema run generate
# 2. codegen the ORM from the SDL
pnpm --filter @constructive-io/functions-sdk run generate
```

Or from the repo root:

```bash
pnpm run generate:sdk
```

## Usage

Each target is exported as a namespace (`infra`) exposing a `createClient`
factory with one accessor per table.

```ts
import { infra } from '@constructive-io/functions-sdk';

const db = infra.createClient({
  endpoint: process.env.GRAPHQL_URL!,
  headers: { 'X-Database-Id': databaseId },
});

const fns = await db.platformFunctionDefinition
  .findMany({ select: { id: true, name: true, taskIdentifier: true }, first: 50 })
  .execute();
```

> The exact exported client/method names are determined by codegen — see the
> generated `src/<target>/` and the `orm-infra` skill in `.agents/skills/`.

## Generated (do not edit)

- `src/**`

Edit the pgpm source under `pgpm/constructive-infra`, regenerate the schema, then
regenerate this SDK.
