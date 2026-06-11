# platformFunctionGraphRef

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Branch heads — mutable pointers into the commit chain

## Usage

```typescript
db.platformFunctionGraphRef.findMany({ select: { id: true } }).execute()
db.platformFunctionGraphRef.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformFunctionGraphRef.create({ data: { commitId: '<UUID>', databaseId: '<UUID>', name: '<String>', storeId: '<UUID>' }, select: { id: true } }).execute()
db.platformFunctionGraphRef.update({ where: { id: '<UUID>' }, data: { commitId: '<UUID>' }, select: { id: true } }).execute()
db.platformFunctionGraphRef.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformFunctionGraphRef records

```typescript
const items = await db.platformFunctionGraphRef.findMany({
  select: { id: true, commitId: true }
}).execute();
```

### Create a platformFunctionGraphRef

```typescript
const item = await db.platformFunctionGraphRef.create({
  data: { commitId: '<UUID>', databaseId: '<UUID>', name: '<String>', storeId: '<UUID>' },
  select: { id: true }
}).execute();
```
