# platformSaveGraph

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Execute the platformSaveGraph mutation

## Usage

```typescript
db.mutation.platformSaveGraph({ input: { graphId: '<UUID>', rootHash: '<UUID>', message: '<String>' } }).execute()
```

## Examples

### Run platformSaveGraph

```typescript
const result = await db.mutation.platformSaveGraph({ input: { graphId: '<UUID>', rootHash: '<UUID>', message: '<String>' } }).execute();
```
