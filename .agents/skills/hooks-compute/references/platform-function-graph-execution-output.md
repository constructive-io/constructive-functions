# platformFunctionGraphExecutionOutput

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Content-addressed store for execution outputs — hash-referenced from node_outputs

## Usage

```typescript
usePlatformFunctionGraphExecutionOutputsQuery({ selection: { fields: { createdAt: true, data: true, databaseId: true, hash: true, id: true } } })
usePlatformFunctionGraphExecutionOutputQuery({ id: '<UUID>', selection: { fields: { createdAt: true, data: true, databaseId: true, hash: true, id: true } } })
useCreatePlatformFunctionGraphExecutionOutputMutation({ selection: { fields: { id: true } } })
useUpdatePlatformFunctionGraphExecutionOutputMutation({ selection: { fields: { id: true } } })
useDeletePlatformFunctionGraphExecutionOutputMutation({})
```

## Examples

### List all platformFunctionGraphExecutionOutputs

```typescript
const { data, isLoading } = usePlatformFunctionGraphExecutionOutputsQuery({
  selection: { fields: { createdAt: true, data: true, databaseId: true, hash: true, id: true } },
});
```

### Create a platformFunctionGraphExecutionOutput

```typescript
const { mutate } = useCreatePlatformFunctionGraphExecutionOutputMutation({
  selection: { fields: { id: true } },
});
mutate({ data: '<JSON>', databaseId: '<UUID>', hash: '<Base64EncodedBinary>' });
```
