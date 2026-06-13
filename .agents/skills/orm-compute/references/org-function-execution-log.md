# orgFunctionExecutionLog

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Function execution logs — structured console output per invocation

## Usage

```typescript
db.orgFunctionExecutionLog.findMany({ select: { id: true } }).execute()
db.orgFunctionExecutionLog.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.orgFunctionExecutionLog.create({ data: { actorId: '<UUID>', invocationId: '<UUID>', logLevel: '<String>', message: '<String>', metadata: '<JSON>', taskIdentifier: '<String>' }, select: { id: true } }).execute()
db.orgFunctionExecutionLog.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute()
db.orgFunctionExecutionLog.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all orgFunctionExecutionLog records

```typescript
const items = await db.orgFunctionExecutionLog.findMany({
  select: { id: true, actorId: true }
}).execute();
```

### Create a orgFunctionExecutionLog

```typescript
const item = await db.orgFunctionExecutionLog.create({
  data: { actorId: '<UUID>', invocationId: '<UUID>', logLevel: '<String>', message: '<String>', metadata: '<JSON>', taskIdentifier: '<String>' },
  select: { id: true }
}).execute();
```
