# platformFunctionGraphExecutionOutput

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Content-addressed store for execution outputs — hash-referenced from node_outputs

## Usage

```typescript
db.platformFunctionGraphExecutionOutput.findMany({ select: { id: true } }).execute()
db.platformFunctionGraphExecutionOutput.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformFunctionGraphExecutionOutput.create({ data: { data: '<JSON>', databaseId: '<UUID>', hash: '<Base64EncodedBinary>' }, select: { id: true } }).execute()
db.platformFunctionGraphExecutionOutput.update({ where: { id: '<UUID>' }, data: { data: '<JSON>' }, select: { id: true } }).execute()
db.platformFunctionGraphExecutionOutput.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformFunctionGraphExecutionOutput records

```typescript
const items = await db.platformFunctionGraphExecutionOutput.findMany({
  select: { id: true, data: true }
}).execute();
```

### Create a platformFunctionGraphExecutionOutput

```typescript
const item = await db.platformFunctionGraphExecutionOutput.create({
  data: { data: '<JSON>', databaseId: '<UUID>', hash: '<Base64EncodedBinary>' },
  select: { id: true }
}).execute();
```
