# orgFunctionExecutionLog

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Function execution logs — structured console output per invocation

## Usage

```typescript
useOrgFunctionExecutionLogsQuery({ selection: { fields: { createdAt: true, actorId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } } })
useOrgFunctionExecutionLogQuery({ id: '<UUID>', selection: { fields: { createdAt: true, actorId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } } })
useCreateOrgFunctionExecutionLogMutation({ selection: { fields: { id: true } } })
useUpdateOrgFunctionExecutionLogMutation({ selection: { fields: { id: true } } })
useDeleteOrgFunctionExecutionLogMutation({})
```

## Examples

### List all orgFunctionExecutionLogs

```typescript
const { data, isLoading } = useOrgFunctionExecutionLogsQuery({
  selection: { fields: { createdAt: true, actorId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } },
});
```

### Create a orgFunctionExecutionLog

```typescript
const { mutate } = useCreateOrgFunctionExecutionLogMutation({
  selection: { fields: { id: true } },
});
mutate({ actorId: '<UUID>', invocationId: '<UUID>', logLevel: '<String>', message: '<String>', metadata: '<JSON>', taskIdentifier: '<String>' });
```
