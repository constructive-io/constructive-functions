# platformFunctionGraphObject

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children

## Usage

```typescript
db.platformFunctionGraphObject.findMany({ select: { id: true } }).execute()
db.platformFunctionGraphObject.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformFunctionGraphObject.create({ data: { data: '<JSON>', databaseId: '<UUID>', kids: '<UUID>', ktree: '<String>' }, select: { id: true } }).execute()
db.platformFunctionGraphObject.update({ where: { id: '<UUID>' }, data: { data: '<JSON>' }, select: { id: true } }).execute()
db.platformFunctionGraphObject.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformFunctionGraphObject records

```typescript
const items = await db.platformFunctionGraphObject.findMany({
  select: { id: true, data: true }
}).execute();
```

### Create a platformFunctionGraphObject

```typescript
const item = await db.platformFunctionGraphObject.create({
  data: { data: '<JSON>', databaseId: '<UUID>', kids: '<UUID>', ktree: '<String>' },
  select: { id: true }
}).execute();
```
