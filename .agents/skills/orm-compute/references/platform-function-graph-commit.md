# platformFunctionGraphCommit

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Commit history — each commit snapshots a tree root for a store

## Usage

```typescript
db.platformFunctionGraphCommit.findMany({ select: { id: true } }).execute()
db.platformFunctionGraphCommit.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformFunctionGraphCommit.create({ data: { authorId: '<UUID>', committerId: '<UUID>', databaseId: '<UUID>', date: '<Datetime>', message: '<String>', parentIds: '<UUID>', storeId: '<UUID>', treeId: '<UUID>' }, select: { id: true } }).execute()
db.platformFunctionGraphCommit.update({ where: { id: '<UUID>' }, data: { authorId: '<UUID>' }, select: { id: true } }).execute()
db.platformFunctionGraphCommit.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformFunctionGraphCommit records

```typescript
const items = await db.platformFunctionGraphCommit.findMany({
  select: { id: true, authorId: true }
}).execute();
```

### Create a platformFunctionGraphCommit

```typescript
const item = await db.platformFunctionGraphCommit.create({
  data: { authorId: '<UUID>', committerId: '<UUID>', databaseId: '<UUID>', date: '<Datetime>', message: '<String>', parentIds: '<UUID>', storeId: '<UUID>', treeId: '<UUID>' },
  select: { id: true }
}).execute();
```
