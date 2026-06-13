---
name: hooks-api
description: React Query hooks for the api API — provides typed query and mutation hooks for 8 tables and 9 custom operations
---

# hooks-api

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

React Query hooks for the api API — provides typed query and mutation hooks for 8 tables and 9 custom operations

## Usage

```typescript
// Import hooks
import { useRoleTypesQuery } from './hooks';

// Query hooks: use<Model>Query, use<Model>sQuery
// Mutation hooks: useCreate<Model>Mutation, useUpdate<Model>Mutation, useDelete<Model>Mutation
// Bulk mutation hooks (when enabled): useBulkCreate<Model>Mutation, useBulkUpsert<Model>Mutation, etc.

const { data, isLoading } = useRoleTypesQuery({
  selection: { fields: { id: true } },
});
```

## Examples

### Query records

```typescript
const { data, isLoading } = useRoleTypesQuery({
  selection: { fields: { id: true } },
});
```

## References

See the `references/` directory for detailed per-entity API documentation:

- [role-type](references/role-type.md)
- [platform-config-definition](references/platform-config-definition.md)
- [platform-namespace](references/platform-namespace.md)
- [platform-config](references/platform-config.md)
- [platform-bucket](references/platform-bucket.md)
- [platform-file](references/platform-file.md)
- [user](references/user.md)
- [platform-namespace-event](references/platform-namespace-event.md)
- [platform-secrets-del](references/platform-secrets-del.md)
- [platform-secrets-set](references/platform-secrets-set.md)
- [org-secrets-del](references/org-secrets-del.md)
- [org-secrets-set](references/org-secrets-set.md)
- [org-secrets-remove-array](references/org-secrets-remove-array.md)
- [platform-files-rename](references/platform-files-rename.md)
- [upload-platform-file](references/upload-platform-file.md)
- [upload-platform-files](references/upload-platform-files.md)
- [provision-bucket](references/provision-bucket.md)
