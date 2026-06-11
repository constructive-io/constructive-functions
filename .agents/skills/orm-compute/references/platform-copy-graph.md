# platformCopyGraph

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Execute the platformCopyGraph mutation

## Usage

```typescript
db.mutation.platformCopyGraph({ input: { databaseId: '<UUID>', graphId: '<UUID>', name: '<String>' } }).execute()
```

## Examples

### Run platformCopyGraph

```typescript
const result = await db.mutation.platformCopyGraph({ input: { databaseId: '<UUID>', graphId: '<UUID>', name: '<String>' } }).execute();
```
