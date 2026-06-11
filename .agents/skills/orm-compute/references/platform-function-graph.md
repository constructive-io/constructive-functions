# platformFunctionGraph

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store

## Usage

```typescript
db.platformFunctionGraph.findMany({ select: { id: true } }).execute()
db.platformFunctionGraph.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformFunctionGraph.create({ data: { context: '<String>', createdBy: '<UUID>', databaseId: '<UUID>', definitionsCommitId: '<UUID>', description: '<String>', entityId: '<UUID>', isValid: '<Boolean>', name: '<String>', storeId: '<UUID>', validationErrors: '<JSON>' }, select: { id: true } }).execute()
db.platformFunctionGraph.update({ where: { id: '<UUID>' }, data: { context: '<String>' }, select: { id: true } }).execute()
db.platformFunctionGraph.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformFunctionGraph records

```typescript
const items = await db.platformFunctionGraph.findMany({
  select: { id: true, context: true }
}).execute();
```

### Create a platformFunctionGraph

```typescript
const item = await db.platformFunctionGraph.create({
  data: { context: '<String>', createdBy: '<UUID>', databaseId: '<UUID>', definitionsCommitId: '<UUID>', description: '<String>', entityId: '<UUID>', isValid: '<Boolean>', name: '<String>', storeId: '<UUID>', validationErrors: '<JSON>' },
  select: { id: true }
}).execute();
```
