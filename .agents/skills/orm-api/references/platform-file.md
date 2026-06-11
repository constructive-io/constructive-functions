# platformFile

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Individual file records within buckets, with immutable identity fields and mutable metadata

## Usage

```typescript
db.platformFile.findMany({ select: { id: true } }).execute()
db.platformFile.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformFile.create({ data: { filePath: '<String>', actorId: '<UUID>', bucketId: '<UUID>', contentHash: '<String>', databaseId: '<UUID>', description: '<String>', filename: '<String>', isPublic: '<Boolean>', key: '<String>', mimeType: '<String>', size: '<BigInt>', tags: '<String>', upload: '<Upload>', status: '<FileStatus>', downloadUrl: '<String>' }, select: { id: true } }).execute()
db.platformFile.update({ where: { id: '<UUID>' }, data: { filePath: '<String>' }, select: { id: true } }).execute()
db.platformFile.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformFile records

```typescript
const items = await db.platformFile.findMany({
  select: { id: true, filePath: true }
}).execute();
```

### Create a platformFile

```typescript
const item = await db.platformFile.create({
  data: { filePath: '<String>', actorId: '<UUID>', bucketId: '<UUID>', contentHash: '<String>', databaseId: '<UUID>', description: '<String>', filename: '<String>', isPublic: '<Boolean>', key: '<String>', mimeType: '<String>', size: '<BigInt>', tags: '<String>', upload: '<Upload>', status: '<FileStatus>', downloadUrl: '<String>' },
  select: { id: true }
}).execute();
```
