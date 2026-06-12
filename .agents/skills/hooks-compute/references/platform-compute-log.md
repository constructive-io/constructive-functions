# platformComputeLog

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

React Query hooks for PlatformComputeLog data operations

## Usage

```typescript
usePlatformComputeLogsQuery({ selection: { fields: { completedAt: true, id: true, databaseId: true, entityId: true, organizationId: true, entityType: true, actorId: true, taskIdentifier: true, jobId: true, invocationId: true, status: true, durationMs: true, error: true } } })
usePlatformComputeLogQuery({ id: '<UUID>', selection: { fields: { completedAt: true, id: true, databaseId: true, entityId: true, organizationId: true, entityType: true, actorId: true, taskIdentifier: true, jobId: true, invocationId: true, status: true, durationMs: true, error: true } } })
useCreatePlatformComputeLogMutation({ selection: { fields: { id: true } } })
useUpdatePlatformComputeLogMutation({ selection: { fields: { id: true } } })
useDeletePlatformComputeLogMutation({})
```

## Examples

### List all platformComputeLogs

```typescript
const { data, isLoading } = usePlatformComputeLogsQuery({
  selection: { fields: { completedAt: true, id: true, databaseId: true, entityId: true, organizationId: true, entityType: true, actorId: true, taskIdentifier: true, jobId: true, invocationId: true, status: true, durationMs: true, error: true } },
});
```

### Create a platformComputeLog

```typescript
const { mutate } = useCreatePlatformComputeLogMutation({
  selection: { fields: { id: true } },
});
mutate({ completedAt: '<Datetime>', databaseId: '<UUID>', entityId: '<UUID>', organizationId: '<UUID>', entityType: '<String>', actorId: '<UUID>', taskIdentifier: '<String>', jobId: '<BigInt>', invocationId: '<UUID>', status: '<String>', durationMs: '<Int>', error: '<String>' });
```
