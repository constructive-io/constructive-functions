# platformFunctionGraph

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store

## Usage

```typescript
usePlatformFunctionGraphsQuery({ selection: { fields: { context: true, createdAt: true, createdBy: true, databaseId: true, definitionsCommitId: true, description: true, entityId: true, id: true, isValid: true, name: true, storeId: true, updatedAt: true, validationErrors: true } } })
usePlatformFunctionGraphQuery({ id: '<UUID>', selection: { fields: { context: true, createdAt: true, createdBy: true, databaseId: true, definitionsCommitId: true, description: true, entityId: true, id: true, isValid: true, name: true, storeId: true, updatedAt: true, validationErrors: true } } })
useCreatePlatformFunctionGraphMutation({ selection: { fields: { id: true } } })
useUpdatePlatformFunctionGraphMutation({ selection: { fields: { id: true } } })
useDeletePlatformFunctionGraphMutation({})
```

## Examples

### List all platformFunctionGraphs

```typescript
const { data, isLoading } = usePlatformFunctionGraphsQuery({
  selection: { fields: { context: true, createdAt: true, createdBy: true, databaseId: true, definitionsCommitId: true, description: true, entityId: true, id: true, isValid: true, name: true, storeId: true, updatedAt: true, validationErrors: true } },
});
```

### Create a platformFunctionGraph

```typescript
const { mutate } = useCreatePlatformFunctionGraphMutation({
  selection: { fields: { id: true } },
});
mutate({ context: '<String>', createdBy: '<UUID>', databaseId: '<UUID>', definitionsCommitId: '<UUID>', description: '<String>', entityId: '<UUID>', isValid: '<Boolean>', name: '<String>', storeId: '<UUID>', validationErrors: '<JSON>' });
```
