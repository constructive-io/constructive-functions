# @constructive-functions/constructive-functions-schema

Exported GraphQL schemas (SDL) for all Constructive Functions APIs, generated from the live GraphQL server endpoints.

## APIs

| API | Domain | Description |
|-----|--------|-------------|
| `api` | api.localhost | Platform introspection + general app schemas (users, infra, storage, store) |
| `compute` | compute.localhost | Function definitions, invocations, execution logs, FBP graph |
| `objects` | objects.localhost | Content-addressed merkle store |

## Generating Schemas

Requires the GraphQL server to be running (`make up`):

```bash
pnpm run generate
```

This fetches the SDL from each API endpoint and writes it to `schemas/<api-name>.graphql`.

## Usage

Other packages can reference the exported schemas via `schemaDir`:

```typescript
import { generate, expandSchemaDirToMultiTarget } from '@constructive-io/graphql-codegen';

const config = {
  schemaDir: '../constructive-functions-schema/schemas',
  output: './src',
  orm: true,
};

const expanded = expandSchemaDirToMultiTarget(config);
```
