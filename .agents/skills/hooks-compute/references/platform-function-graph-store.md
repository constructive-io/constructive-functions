# platformFunctionGraphStore

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Named stores — one per version-controlled tree (e.g. one graph, one definition set)

## Usage

```typescript
usePlatformFunctionGraphStoresQuery({ selection: { fields: { createdAt: true, databaseId: true, hash: true, id: true, name: true } } })
usePlatformFunctionGraphStoreQuery({ id: '<UUID>', selection: { fields: { createdAt: true, databaseId: true, hash: true, id: true, name: true } } })
useCreatePlatformFunctionGraphStoreMutation({ selection: { fields: { id: true } } })
useUpdatePlatformFunctionGraphStoreMutation({ selection: { fields: { id: true } } })
useDeletePlatformFunctionGraphStoreMutation({})
```

## Examples

### List all platformFunctionGraphStores

```typescript
const { data, isLoading } = usePlatformFunctionGraphStoresQuery({
  selection: { fields: { createdAt: true, databaseId: true, hash: true, id: true, name: true } },
});
```

### Create a platformFunctionGraphStore

```typescript
const { mutate } = useCreatePlatformFunctionGraphStoreMutation({
  selection: { fields: { id: true } },
});
mutate({ databaseId: '<UUID>', hash: '<UUID>', name: '<String>' });
```
