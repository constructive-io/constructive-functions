# platformBucket

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Logical storage containers that group files with shared access policies and CDN behavior

## Usage

```typescript
usePlatformBucketsQuery({ selection: { fields: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, databaseId: true, description: true, id: true, isPublic: true, key: true, maxFileSize: true, type: true, updatedAt: true } } })
usePlatformBucketQuery({ id: '<UUID>', selection: { fields: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, databaseId: true, description: true, id: true, isPublic: true, key: true, maxFileSize: true, type: true, updatedAt: true } } })
useCreatePlatformBucketMutation({ selection: { fields: { id: true } } })
useUpdatePlatformBucketMutation({ selection: { fields: { id: true } } })
useDeletePlatformBucketMutation({})
```

## Examples

### List all platformBuckets

```typescript
const { data, isLoading } = usePlatformBucketsQuery({
  selection: { fields: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, databaseId: true, description: true, id: true, isPublic: true, key: true, maxFileSize: true, type: true, updatedAt: true } },
});
```

### Create a platformBucket

```typescript
const { mutate } = useCreatePlatformBucketMutation({
  selection: { fields: { id: true } },
});
mutate({ actorId: '<UUID>', allowCustomKeys: '<Boolean>', allowedMimeTypes: '<String>', allowedOrigins: '<String>', databaseId: '<UUID>', description: '<String>', isPublic: '<Boolean>', key: '<String>', maxFileSize: '<BigInt>', type: '<String>' });
```
