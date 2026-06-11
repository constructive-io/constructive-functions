# platformNamespace

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Logical namespace containers for grouping secrets, config, functions, and other resources

## Usage

```typescript
usePlatformNamespacesQuery({ selection: { fields: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, isActive: true, labels: true, name: true, namespaceName: true, updatedAt: true } } })
usePlatformNamespaceQuery({ id: '<UUID>', selection: { fields: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, isActive: true, labels: true, name: true, namespaceName: true, updatedAt: true } } })
useCreatePlatformNamespaceMutation({ selection: { fields: { id: true } } })
useUpdatePlatformNamespaceMutation({ selection: { fields: { id: true } } })
useDeletePlatformNamespaceMutation({})
```

## Examples

### List all platformNamespaces

```typescript
const { data, isLoading } = usePlatformNamespacesQuery({
  selection: { fields: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, isActive: true, labels: true, name: true, namespaceName: true, updatedAt: true } },
});
```

### Create a platformNamespace

```typescript
const { mutate } = useCreatePlatformNamespaceMutation({
  selection: { fields: { id: true } },
});
mutate({ annotations: '<JSON>', databaseId: '<UUID>', description: '<String>', isActive: '<Boolean>', labels: '<JSON>', name: '<String>', namespaceName: '<String>' });
```
