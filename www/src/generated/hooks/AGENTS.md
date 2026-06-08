# React Query Hooks

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

## Stack

- React Query hooks wrapping ORM operations (TypeScript)
- 10 tables, 16 custom operations
- Query hooks return `UseQueryResult`, mutation hooks return `UseMutationResult`

## Quick Start

```typescript
import { configure } from './hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

configure({ endpoint: 'https://api.example.com/graphql' });
const queryClient = new QueryClient();
// Wrap app in <QueryClientProvider client={queryClient}>
```

## Resources

- **Full API reference:** [README.md](./README.md) — hook docs for all 10 tables
- **Schema types:** [types.ts](./types.ts)
- **Hooks module:** [hooks.ts](./hooks.ts)

## Conventions

- Query hooks: `use<PluralName>Query`, `use<SingularName>Query`
- Mutation hooks: `useCreate<Name>Mutation`, `useUpdate<Name>Mutation`, `useDelete<Name>Mutation`
- Bulk mutation hooks (when enabled): `useBulkCreate<Name>Mutation`, `useBulkUpsert<Name>Mutation`, `useBulkUpdate<Name>Mutation`, `useBulkDelete<Name>Mutation`
- All hooks accept a `selection` parameter to pick fields

## Boundaries

All files in this directory are generated. Do not edit manually.
