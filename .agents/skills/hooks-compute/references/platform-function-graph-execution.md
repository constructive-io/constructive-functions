# platformFunctionGraphExecution

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Ephemeral execution state for flow graph evaluation

## Usage

```typescript
usePlatformFunctionGraphExecutionsQuery({ selection: { fields: { startedAt: true, completedAt: true, currentWave: true, databaseId: true, definitionsCommitId: true, entityId: true, errorCode: true, errorMessage: true, executionPlan: true, graphId: true, id: true, inputPayload: true, invocationId: true, maxPendingJobs: true, maxTicks: true, nodeOutputs: true, outputNode: true, outputPayload: true, outputPort: true, parentExecutionId: true, parentNodeName: true, status: true, tickCount: true, timeoutAt: true } } })
usePlatformFunctionGraphExecutionQuery({ id: '<UUID>', selection: { fields: { startedAt: true, completedAt: true, currentWave: true, databaseId: true, definitionsCommitId: true, entityId: true, errorCode: true, errorMessage: true, executionPlan: true, graphId: true, id: true, inputPayload: true, invocationId: true, maxPendingJobs: true, maxTicks: true, nodeOutputs: true, outputNode: true, outputPayload: true, outputPort: true, parentExecutionId: true, parentNodeName: true, status: true, tickCount: true, timeoutAt: true } } })
useCreatePlatformFunctionGraphExecutionMutation({ selection: { fields: { id: true } } })
useUpdatePlatformFunctionGraphExecutionMutation({ selection: { fields: { id: true } } })
useDeletePlatformFunctionGraphExecutionMutation({})
```

## Examples

### List all platformFunctionGraphExecutions

```typescript
const { data, isLoading } = usePlatformFunctionGraphExecutionsQuery({
  selection: { fields: { startedAt: true, completedAt: true, currentWave: true, databaseId: true, definitionsCommitId: true, entityId: true, errorCode: true, errorMessage: true, executionPlan: true, graphId: true, id: true, inputPayload: true, invocationId: true, maxPendingJobs: true, maxTicks: true, nodeOutputs: true, outputNode: true, outputPayload: true, outputPort: true, parentExecutionId: true, parentNodeName: true, status: true, tickCount: true, timeoutAt: true } },
});
```

### Create a platformFunctionGraphExecution

```typescript
const { mutate } = useCreatePlatformFunctionGraphExecutionMutation({
  selection: { fields: { id: true } },
});
mutate({ startedAt: '<Datetime>', completedAt: '<Datetime>', currentWave: '<Int>', databaseId: '<UUID>', definitionsCommitId: '<UUID>', entityId: '<UUID>', errorCode: '<String>', errorMessage: '<String>', executionPlan: '<JSON>', graphId: '<UUID>', inputPayload: '<JSON>', invocationId: '<UUID>', maxPendingJobs: '<Int>', maxTicks: '<Int>', nodeOutputs: '<JSON>', outputNode: '<String>', outputPayload: '<JSON>', outputPort: '<String>', parentExecutionId: '<UUID>', parentNodeName: '<String>', status: '<String>', tickCount: '<Int>', timeoutAt: '<Datetime>' });
```
