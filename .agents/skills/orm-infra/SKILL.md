---
name: orm-infra
description: ORM client for the infra API — provides typed CRUD operations for 6 tables and 1 custom operations
---

# orm-infra

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

ORM client for the infra API — provides typed CRUD operations for 6 tables and 1 custom operations

## Usage

```typescript
// Import the ORM client
import { db } from './orm';

// Available models: platformSecretDefinition, platformFunctionExecutionLog, platformNamespace, platformFunctionInvocation, platformNamespaceEvent, platformFunctionDefinition
db.<model>.findMany({ select: { id: true } }).execute()
db.<model>.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.<model>.create({ data: { ... }, select: { id: true } }).execute()
db.<model>.update({ where: { id: '<UUID>' }, data: { ... }, select: { id: true } }).execute()
db.<model>.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### Query records

```typescript
const items = await db.platformSecretDefinition.findMany({
  select: { id: true }
}).execute();
```

## References

See the `references/` directory for detailed per-entity API documentation:

- [platform-secret-definition](references/platform-secret-definition.md)
- [platform-function-execution-log](references/platform-function-execution-log.md)
- [platform-namespace](references/platform-namespace.md)
- [platform-function-invocation](references/platform-function-invocation.md)
- [platform-namespace-event](references/platform-namespace-event.md)
- [platform-function-definition](references/platform-function-definition.md)
- [provision-bucket](references/provision-bucket.md)
