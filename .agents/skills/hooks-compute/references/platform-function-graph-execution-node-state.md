# platformFunctionGraphExecutionNodeState

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Per-node execution state — tracks individual node lifecycle for debugging

## Usage

```typescript
usePlatformFunctionGraphExecutionNodeStatesQuery({ selection: { fields: { createdAt: true, completedAt: true, databaseId: true, errorCode: true, errorMessage: true, executionId: true, id: true, nodeName: true, outputId: true, startedAt: true, status: true, nodePath: true } } })
usePlatformFunctionGraphExecutionNodeStateQuery({ id: '<UUID>', selection: { fields: { createdAt: true, completedAt: true, databaseId: true, errorCode: true, errorMessage: true, executionId: true, id: true, nodeName: true, outputId: true, startedAt: true, status: true, nodePath: true } } })
useCreatePlatformFunctionGraphExecutionNodeStateMutation({ selection: { fields: { id: true } } })
useUpdatePlatformFunctionGraphExecutionNodeStateMutation({ selection: { fields: { id: true } } })
useDeletePlatformFunctionGraphExecutionNodeStateMutation({})
```

## Examples

### List all platformFunctionGraphExecutionNodeStates

```typescript
const { data, isLoading } = usePlatformFunctionGraphExecutionNodeStatesQuery({
  selection: { fields: { createdAt: true, completedAt: true, databaseId: true, errorCode: true, errorMessage: true, executionId: true, id: true, nodeName: true, outputId: true, startedAt: true, status: true, nodePath: true } },
});
```

### Create a platformFunctionGraphExecutionNodeState

```typescript
const { mutate } = useCreatePlatformFunctionGraphExecutionNodeStateMutation({
  selection: { fields: { id: true } },
});
mutate({ completedAt: '<Datetime>', databaseId: '<UUID>', errorCode: '<String>', errorMessage: '<String>', executionId: '<UUID>', nodeName: '<String>', outputId: '<UUID>', startedAt: '<Datetime>', status: '<String>', nodePath: '<String>' });
```
