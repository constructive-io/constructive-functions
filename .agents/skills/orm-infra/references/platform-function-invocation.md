# platformFunctionInvocation

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Function invocation log — INSERT to call a function (business-layer, metered)

## Usage

```typescript
db.platformFunctionInvocation.findMany({ select: { id: true } }).execute()
db.platformFunctionInvocation.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformFunctionInvocation.create({ data: { actorId: '<UUID>', completedAt: '<Datetime>', databaseId: '<UUID>', durationMs: '<Int>', error: '<String>', functionId: '<UUID>', jobId: '<BigInt>', payload: '<JSON>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' }, select: { id: true } }).execute()
db.platformFunctionInvocation.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute()
db.platformFunctionInvocation.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformFunctionInvocation records

```typescript
const items = await db.platformFunctionInvocation.findMany({
  select: { id: true, actorId: true }
}).execute();
```

### Create a platformFunctionInvocation

```typescript
const item = await db.platformFunctionInvocation.create({
  data: { actorId: '<UUID>', completedAt: '<Datetime>', databaseId: '<UUID>', durationMs: '<Int>', error: '<String>', functionId: '<UUID>', jobId: '<BigInt>', payload: '<JSON>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' },
  select: { id: true }
}).execute();
```
