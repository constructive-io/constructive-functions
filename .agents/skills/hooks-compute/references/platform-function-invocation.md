# platformFunctionInvocation

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions by task_identifier string.

## Usage

```typescript
usePlatformFunctionInvocationsQuery({ selection: { fields: { createdAt: true, actorId: true, completedAt: true, databaseId: true, durationMs: true, error: true, graphExecutionId: true, id: true, jobId: true, parentInvocationId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } } })
usePlatformFunctionInvocationQuery({ id: '<UUID>', selection: { fields: { createdAt: true, actorId: true, completedAt: true, databaseId: true, durationMs: true, error: true, graphExecutionId: true, id: true, jobId: true, parentInvocationId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } } })
useCreatePlatformFunctionInvocationMutation({ selection: { fields: { id: true } } })
useUpdatePlatformFunctionInvocationMutation({ selection: { fields: { id: true } } })
useDeletePlatformFunctionInvocationMutation({})
```

## Examples

### List all platformFunctionInvocations

```typescript
const { data, isLoading } = usePlatformFunctionInvocationsQuery({
  selection: { fields: { createdAt: true, actorId: true, completedAt: true, databaseId: true, durationMs: true, error: true, graphExecutionId: true, id: true, jobId: true, parentInvocationId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } },
});
```

### Create a platformFunctionInvocation

```typescript
const { mutate } = useCreatePlatformFunctionInvocationMutation({
  selection: { fields: { id: true } },
});
mutate({ actorId: '<UUID>', completedAt: '<Datetime>', databaseId: '<UUID>', durationMs: '<Int>', error: '<String>', graphExecutionId: '<UUID>', jobId: '<BigInt>', parentInvocationId: '<UUID>', payload: '<JSON>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' });
```
