# platformFunctionGraphExecution

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Ephemeral execution state for flow graph evaluation

## Usage

```typescript
db.platformFunctionGraphExecution.findMany({ select: { id: true } }).execute()
db.platformFunctionGraphExecution.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformFunctionGraphExecution.create({ data: { startedAt: '<Datetime>', completedAt: '<Datetime>', currentWave: '<Int>', databaseId: '<UUID>', definitionsCommitId: '<UUID>', entityId: '<UUID>', errorCode: '<String>', errorMessage: '<String>', executionPlan: '<JSON>', graphId: '<UUID>', inputPayload: '<JSON>', invocationId: '<UUID>', maxPendingJobs: '<Int>', maxTicks: '<Int>', nodeOutputs: '<JSON>', outputNode: '<String>', outputPayload: '<JSON>', outputPort: '<String>', parentExecutionId: '<UUID>', parentNodeName: '<String>', status: '<String>', tickCount: '<Int>', timeoutAt: '<Datetime>' }, select: { id: true } }).execute()
db.platformFunctionGraphExecution.update({ where: { id: '<UUID>' }, data: { startedAt: '<Datetime>' }, select: { id: true } }).execute()
db.platformFunctionGraphExecution.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformFunctionGraphExecution records

```typescript
const items = await db.platformFunctionGraphExecution.findMany({
  select: { id: true, startedAt: true }
}).execute();
```

### Create a platformFunctionGraphExecution

```typescript
const item = await db.platformFunctionGraphExecution.create({
  data: { startedAt: '<Datetime>', completedAt: '<Datetime>', currentWave: '<Int>', databaseId: '<UUID>', definitionsCommitId: '<UUID>', entityId: '<UUID>', errorCode: '<String>', errorMessage: '<String>', executionPlan: '<JSON>', graphId: '<UUID>', inputPayload: '<JSON>', invocationId: '<UUID>', maxPendingJobs: '<Int>', maxTicks: '<Int>', nodeOutputs: '<JSON>', outputNode: '<String>', outputPayload: '<JSON>', outputPort: '<String>', parentExecutionId: '<UUID>', parentNodeName: '<String>', status: '<String>', tickCount: '<Int>', timeoutAt: '<Datetime>' },
  select: { id: true }
}).execute();
```
