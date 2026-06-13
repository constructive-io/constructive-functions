# platformComputeLog

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

ORM operations for PlatformComputeLog records

## Usage

```typescript
db.platformComputeLog.findMany({ select: { id: true } }).execute()
db.platformComputeLog.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformComputeLog.create({ data: { completedAt: '<Datetime>', databaseId: '<UUID>', entityId: '<UUID>', organizationId: '<UUID>', entityType: '<String>', actorId: '<UUID>', taskIdentifier: '<String>', jobId: '<BigInt>', invocationId: '<UUID>', status: '<String>', durationMs: '<Int>', error: '<String>' }, select: { id: true } }).execute()
db.platformComputeLog.update({ where: { id: '<UUID>' }, data: { completedAt: '<Datetime>' }, select: { id: true } }).execute()
db.platformComputeLog.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformComputeLog records

```typescript
const items = await db.platformComputeLog.findMany({
  select: { id: true, completedAt: true }
}).execute();
```

### Create a platformComputeLog

```typescript
const item = await db.platformComputeLog.create({
  data: { completedAt: '<Datetime>', databaseId: '<UUID>', entityId: '<UUID>', organizationId: '<UUID>', entityType: '<String>', actorId: '<UUID>', taskIdentifier: '<String>', jobId: '<BigInt>', invocationId: '<UUID>', status: '<String>', durationMs: '<Int>', error: '<String>' },
  select: { id: true }
}).execute();
```
