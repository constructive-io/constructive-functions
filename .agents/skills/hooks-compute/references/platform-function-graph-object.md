# platformFunctionGraphObject

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children

## Usage

```typescript
usePlatformFunctionGraphObjectsQuery({ selection: { fields: { createdAt: true, data: true, databaseId: true, id: true, kids: true, ktree: true } } })
usePlatformFunctionGraphObjectQuery({ id: '<UUID>', selection: { fields: { createdAt: true, data: true, databaseId: true, id: true, kids: true, ktree: true } } })
useCreatePlatformFunctionGraphObjectMutation({ selection: { fields: { id: true } } })
useUpdatePlatformFunctionGraphObjectMutation({ selection: { fields: { id: true } } })
useDeletePlatformFunctionGraphObjectMutation({})
```

## Examples

### List all platformFunctionGraphObjects

```typescript
const { data, isLoading } = usePlatformFunctionGraphObjectsQuery({
  selection: { fields: { createdAt: true, data: true, databaseId: true, id: true, kids: true, ktree: true } },
});
```

### Create a platformFunctionGraphObject

```typescript
const { mutate } = useCreatePlatformFunctionGraphObjectMutation({
  selection: { fields: { id: true } },
});
mutate({ data: '<JSON>', databaseId: '<UUID>', kids: '<UUID>', ktree: '<String>' });
```
