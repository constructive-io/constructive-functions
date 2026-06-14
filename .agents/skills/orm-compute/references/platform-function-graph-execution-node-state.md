# platformFunctionGraphExecutionNodeState

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Per-node execution state — tracks individual node lifecycle for debugging

## Usage

```typescript
db.platformFunctionGraphExecutionNodeState.findMany({ select: { id: true } }).execute()
db.platformFunctionGraphExecutionNodeState.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformFunctionGraphExecutionNodeState.create({ data: { completedAt: '<Datetime>', databaseId: '<UUID>', errorCode: '<String>', errorMessage: '<String>', executionId: '<UUID>', nodeName: '<String>', outputId: '<UUID>', startedAt: '<Datetime>', status: '<String>', nodePath: '<String>' }, select: { id: true } }).execute()
db.platformFunctionGraphExecutionNodeState.update({ where: { id: '<UUID>' }, data: { completedAt: '<Datetime>' }, select: { id: true } }).execute()
db.platformFunctionGraphExecutionNodeState.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformFunctionGraphExecutionNodeState records

```typescript
const items = await db.platformFunctionGraphExecutionNodeState.findMany({
  select: { id: true, completedAt: true }
}).execute();
```

### Create a platformFunctionGraphExecutionNodeState

```typescript
const item = await db.platformFunctionGraphExecutionNodeState.create({
  data: { completedAt: '<Datetime>', databaseId: '<UUID>', errorCode: '<String>', errorMessage: '<String>', executionId: '<UUID>', nodeName: '<String>', outputId: '<UUID>', startedAt: '<Datetime>', status: '<String>', nodePath: '<String>' },
  select: { id: true }
}).execute();
```
