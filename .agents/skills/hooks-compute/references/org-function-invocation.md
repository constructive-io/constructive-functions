# orgFunctionInvocation

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions by task_identifier string.

## Usage

```typescript
useOrgFunctionInvocationsQuery({ selection: { fields: { createdAt: true, actorId: true, completedAt: true, durationMs: true, error: true, graphExecutionId: true, id: true, jobId: true, parentInvocationId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } } })
useOrgFunctionInvocationQuery({ id: '<UUID>', selection: { fields: { createdAt: true, actorId: true, completedAt: true, durationMs: true, error: true, graphExecutionId: true, id: true, jobId: true, parentInvocationId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } } })
useCreateOrgFunctionInvocationMutation({ selection: { fields: { id: true } } })
useUpdateOrgFunctionInvocationMutation({ selection: { fields: { id: true } } })
useDeleteOrgFunctionInvocationMutation({})
```

## Examples

### List all orgFunctionInvocations

```typescript
const { data, isLoading } = useOrgFunctionInvocationsQuery({
  selection: { fields: { createdAt: true, actorId: true, completedAt: true, durationMs: true, error: true, graphExecutionId: true, id: true, jobId: true, parentInvocationId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } },
});
```

### Create a orgFunctionInvocation

```typescript
const { mutate } = useCreateOrgFunctionInvocationMutation({
  selection: { fields: { id: true } },
});
mutate({ actorId: '<UUID>', completedAt: '<Datetime>', durationMs: '<Int>', error: '<String>', graphExecutionId: '<UUID>', jobId: '<BigInt>', parentInvocationId: '<UUID>', payload: '<JSON>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' });
```
