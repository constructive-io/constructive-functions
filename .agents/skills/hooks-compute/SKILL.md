---
name: hooks-compute
description: React Query hooks for the compute API — provides typed query and mutation hooks for 14 tables and 16 custom operations
---

# hooks-compute

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

React Query hooks for the compute API — provides typed query and mutation hooks for 14 tables and 16 custom operations

## Usage

```typescript
// Import hooks
import { useGetAllQuery } from './hooks';

// Query hooks: use<Model>Query, use<Model>sQuery
// Mutation hooks: useCreate<Model>Mutation, useUpdate<Model>Mutation, useDelete<Model>Mutation
// Bulk mutation hooks (when enabled): useBulkCreate<Model>Mutation, useBulkUpsert<Model>Mutation, etc.

const { data, isLoading } = useGetAllQuery({
  selection: { fields: { id: true } },
});
```

## Examples

### Query records

```typescript
const { data, isLoading } = useGetAllQuery({
  selection: { fields: { id: true } },
});
```

## References

See the `references/` directory for detailed per-entity API documentation:

- [get-all-record](references/get-all-record.md)
- [platform-function-graph-ref](references/platform-function-graph-ref.md)
- [platform-function-graph-store](references/platform-function-graph-store.md)
- [platform-function-graph-object](references/platform-function-graph-object.md)
- [org-function-execution-log](references/org-function-execution-log.md)
- [platform-function-graph-commit](references/platform-function-graph-commit.md)
- [platform-secret-definition](references/platform-secret-definition.md)
- [platform-function-execution-log](references/platform-function-execution-log.md)
- [platform-function-graph](references/platform-function-graph.md)
- [platform-compute-log](references/platform-compute-log.md)
- [platform-usage-daily](references/platform-usage-daily.md)
- [org-function-invocation](references/org-function-invocation.md)
- [platform-function-invocation](references/platform-function-invocation.md)
- [platform-function-definition](references/platform-function-definition.md)
- [platform-read-function-graph](references/platform-read-function-graph.md)
- [platform-validate-function-graph](references/platform-validate-function-graph.md)
- [init-empty-repo](references/init-empty-repo.md)
- [platform-import-definitions](references/platform-import-definitions.md)
- [set-data-at-path](references/set-data-at-path.md)
- [platform-copy-graph](references/platform-copy-graph.md)
- [platform-save-graph](references/platform-save-graph.md)
- [platform-add-edge-and-save](references/platform-add-edge-and-save.md)
- [platform-add-node-and-save](references/platform-add-node-and-save.md)
- [platform-create-function-graph](references/platform-create-function-graph.md)
- [platform-add-edge](references/platform-add-edge.md)
- [platform-add-node](references/platform-add-node.md)
- [platform-import-graph-json](references/platform-import-graph-json.md)
- [insert-node-at-path](references/insert-node-at-path.md)
- [platform-start-execution](references/platform-start-execution.md)
- [provision-bucket](references/provision-bucket.md)
