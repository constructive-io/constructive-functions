# orgFunctionInvocation

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions by task_identifier string.

## Usage

```typescript
db.orgFunctionInvocation.findMany({ select: { id: true } }).execute()
db.orgFunctionInvocation.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.orgFunctionInvocation.create({ data: { actorId: '<UUID>', completedAt: '<Datetime>', durationMs: '<Int>', error: '<String>', graphExecutionId: '<UUID>', jobId: '<BigInt>', parentInvocationId: '<UUID>', payload: '<JSON>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' }, select: { id: true } }).execute()
db.orgFunctionInvocation.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute()
db.orgFunctionInvocation.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all orgFunctionInvocation records

```typescript
const items = await db.orgFunctionInvocation.findMany({
  select: { id: true, actorId: true }
}).execute();
```

### Create a orgFunctionInvocation

```typescript
const item = await db.orgFunctionInvocation.create({
  data: { actorId: '<UUID>', completedAt: '<Datetime>', durationMs: '<Int>', error: '<String>', graphExecutionId: '<UUID>', jobId: '<BigInt>', parentInvocationId: '<UUID>', payload: '<JSON>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' },
  select: { id: true }
}).execute();
```
