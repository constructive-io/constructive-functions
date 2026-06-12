# platformUsageDaily

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

ORM operations for PlatformUsageDaily records

## Usage

```typescript
db.platformUsageDaily.findMany({ select: { id: true } }).execute()
db.platformUsageDaily.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformUsageDaily.create({ data: { databaseId: '<UUID>', entityId: '<UUID>', organizationId: '<UUID>', entityType: '<String>', taskIdentifier: '<String>', date: '<Date>', totalCalls: '<BigInt>', successful: '<BigInt>', failed: '<BigInt>', totalDurationMs: '<BigInt>', minDurationMs: '<Int>', maxDurationMs: '<Int>' }, select: { id: true } }).execute()
db.platformUsageDaily.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute()
db.platformUsageDaily.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformUsageDaily records

```typescript
const items = await db.platformUsageDaily.findMany({
  select: { id: true, databaseId: true }
}).execute();
```

### Create a platformUsageDaily

```typescript
const item = await db.platformUsageDaily.create({
  data: { databaseId: '<UUID>', entityId: '<UUID>', organizationId: '<UUID>', entityType: '<String>', taskIdentifier: '<String>', date: '<Date>', totalCalls: '<BigInt>', successful: '<BigInt>', failed: '<BigInt>', totalDurationMs: '<BigInt>', minDurationMs: '<Int>', maxDurationMs: '<Int>' },
  select: { id: true }
}).execute();
```
