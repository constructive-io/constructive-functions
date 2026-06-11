# platformFunctionGraphStore

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Named stores — one per version-controlled tree (e.g. one graph, one definition set)

## Usage

```typescript
db.platformFunctionGraphStore.findMany({ select: { id: true } }).execute()
db.platformFunctionGraphStore.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformFunctionGraphStore.create({ data: { databaseId: '<UUID>', hash: '<UUID>', name: '<String>' }, select: { id: true } }).execute()
db.platformFunctionGraphStore.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute()
db.platformFunctionGraphStore.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformFunctionGraphStore records

```typescript
const items = await db.platformFunctionGraphStore.findMany({
  select: { id: true, databaseId: true }
}).execute();
```

### Create a platformFunctionGraphStore

```typescript
const item = await db.platformFunctionGraphStore.create({
  data: { databaseId: '<UUID>', hash: '<UUID>', name: '<String>' },
  select: { id: true }
}).execute();
```
