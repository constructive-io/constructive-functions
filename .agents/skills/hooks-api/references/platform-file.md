# platformFile

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Individual file records within buckets, with immutable identity fields and mutable metadata

## Usage

```typescript
usePlatformFilesQuery({ selection: { fields: { filePath: true, actorId: true, bucketId: true, contentHash: true, createdAt: true, databaseId: true, description: true, filename: true, id: true, isPublic: true, key: true, mimeType: true, size: true, tags: true, updatedAt: true, upload: true, status: true, downloadUrl: true } } })
usePlatformFileQuery({ id: '<UUID>', selection: { fields: { filePath: true, actorId: true, bucketId: true, contentHash: true, createdAt: true, databaseId: true, description: true, filename: true, id: true, isPublic: true, key: true, mimeType: true, size: true, tags: true, updatedAt: true, upload: true, status: true, downloadUrl: true } } })
useCreatePlatformFileMutation({ selection: { fields: { id: true } } })
useUpdatePlatformFileMutation({ selection: { fields: { id: true } } })
useDeletePlatformFileMutation({})
```

## Examples

### List all platformFiles

```typescript
const { data, isLoading } = usePlatformFilesQuery({
  selection: { fields: { filePath: true, actorId: true, bucketId: true, contentHash: true, createdAt: true, databaseId: true, description: true, filename: true, id: true, isPublic: true, key: true, mimeType: true, size: true, tags: true, updatedAt: true, upload: true, status: true, downloadUrl: true } },
});
```

### Create a platformFile

```typescript
const { mutate } = useCreatePlatformFileMutation({
  selection: { fields: { id: true } },
});
mutate({ filePath: '<String>', actorId: '<UUID>', bucketId: '<UUID>', contentHash: '<String>', databaseId: '<UUID>', description: '<String>', filename: '<String>', isPublic: '<Boolean>', key: '<String>', mimeType: '<String>', size: '<BigInt>', tags: '<String>', upload: '<Upload>', status: '<FileStatus>', downloadUrl: '<String>' });
```
