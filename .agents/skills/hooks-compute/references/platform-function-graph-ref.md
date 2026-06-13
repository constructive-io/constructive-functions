# platformFunctionGraphRef

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Branch heads — mutable pointers into the commit chain

## Usage

```typescript
usePlatformFunctionGraphRefsQuery({ selection: { fields: { commitId: true, databaseId: true, id: true, name: true, storeId: true } } })
usePlatformFunctionGraphRefQuery({ id: '<UUID>', selection: { fields: { commitId: true, databaseId: true, id: true, name: true, storeId: true } } })
useCreatePlatformFunctionGraphRefMutation({ selection: { fields: { id: true } } })
useUpdatePlatformFunctionGraphRefMutation({ selection: { fields: { id: true } } })
useDeletePlatformFunctionGraphRefMutation({})
```

## Examples

### List all platformFunctionGraphRefs

```typescript
const { data, isLoading } = usePlatformFunctionGraphRefsQuery({
  selection: { fields: { commitId: true, databaseId: true, id: true, name: true, storeId: true } },
});
```

### Create a platformFunctionGraphRef

```typescript
const { mutate } = useCreatePlatformFunctionGraphRefMutation({
  selection: { fields: { id: true } },
});
mutate({ commitId: '<UUID>', databaseId: '<UUID>', name: '<String>', storeId: '<UUID>' });
```
