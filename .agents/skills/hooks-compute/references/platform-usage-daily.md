# platformUsageDaily

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

React Query hooks for PlatformUsageDaily data operations

## Usage

```typescript
usePlatformUsageDailiesQuery({ selection: { fields: { id: true, databaseId: true, entityId: true, organizationId: true, entityType: true, taskIdentifier: true, date: true, totalCalls: true, successful: true, failed: true, totalDurationMs: true, minDurationMs: true, maxDurationMs: true } } })
usePlatformUsageDailyQuery({ id: '<UUID>', selection: { fields: { id: true, databaseId: true, entityId: true, organizationId: true, entityType: true, taskIdentifier: true, date: true, totalCalls: true, successful: true, failed: true, totalDurationMs: true, minDurationMs: true, maxDurationMs: true } } })
useCreatePlatformUsageDailyMutation({ selection: { fields: { id: true } } })
useUpdatePlatformUsageDailyMutation({ selection: { fields: { id: true } } })
useDeletePlatformUsageDailyMutation({})
```

## Examples

### List all platformUsageDailies

```typescript
const { data, isLoading } = usePlatformUsageDailiesQuery({
  selection: { fields: { id: true, databaseId: true, entityId: true, organizationId: true, entityType: true, taskIdentifier: true, date: true, totalCalls: true, successful: true, failed: true, totalDurationMs: true, minDurationMs: true, maxDurationMs: true } },
});
```

### Create a platformUsageDaily

```typescript
const { mutate } = useCreatePlatformUsageDailyMutation({
  selection: { fields: { id: true } },
});
mutate({ databaseId: '<UUID>', entityId: '<UUID>', organizationId: '<UUID>', entityType: '<String>', taskIdentifier: '<String>', date: '<Date>', totalCalls: '<BigInt>', successful: '<BigInt>', failed: '<BigInt>', totalDurationMs: '<BigInt>', minDurationMs: '<Int>', maxDurationMs: '<Int>' });
```
