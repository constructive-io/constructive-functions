# platformFunctionExecutionLog

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Function execution logs — structured console output per invocation

## Usage

```typescript
usePlatformFunctionExecutionLogsQuery({ selection: { fields: { createdAt: true, actorId: true, databaseId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } } })
usePlatformFunctionExecutionLogQuery({ id: '<UUID>', selection: { fields: { createdAt: true, actorId: true, databaseId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } } })
useCreatePlatformFunctionExecutionLogMutation({ selection: { fields: { id: true } } })
useUpdatePlatformFunctionExecutionLogMutation({ selection: { fields: { id: true } } })
useDeletePlatformFunctionExecutionLogMutation({})
```

## Examples

### List all platformFunctionExecutionLogs

```typescript
const { data, isLoading } = usePlatformFunctionExecutionLogsQuery({
  selection: { fields: { createdAt: true, actorId: true, databaseId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } },
});
```

### Create a platformFunctionExecutionLog

```typescript
const { mutate } = useCreatePlatformFunctionExecutionLogMutation({
  selection: { fields: { id: true } },
});
mutate({ actorId: '<UUID>', databaseId: '<UUID>', invocationId: '<UUID>', logLevel: '<String>', message: '<String>', metadata: '<JSON>', taskIdentifier: '<String>' });
```
