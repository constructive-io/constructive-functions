---
name: orm-api
description: ORM client for the api API — provides typed CRUD operations for 8 tables and 9 custom operations
---

# orm-api

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

ORM client for the api API — provides typed CRUD operations for 8 tables and 9 custom operations

## Usage

```typescript
// Import the ORM client
import { db } from './orm';

// Available models: roleType, platformConfigDefinition, platformNamespace, platformConfig, platformBucket, platformFile, user, platformNamespaceEvent
db.<model>.findMany({ select: { id: true } }).execute()
db.<model>.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.<model>.create({ data: { ... }, select: { id: true } }).execute()
db.<model>.update({ where: { id: '<UUID>' }, data: { ... }, select: { id: true } }).execute()
db.<model>.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### Query records

```typescript
const items = await db.roleType.findMany({
  select: { id: true }
}).execute();
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
