# orgSecretsSet

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Execute the orgSecretsSet mutation

## Usage

```typescript
db.mutation.orgSecretsSet({ input: { ownerId: '<UUID>', secretName: '<String>', secretValue: '<String>', algo: '<String>', secretNamespace: '<String>' } }).execute()
```

## Examples

### Run orgSecretsSet

```typescript
const result = await db.mutation.orgSecretsSet({ input: { ownerId: '<UUID>', secretName: '<String>', secretValue: '<String>', algo: '<String>', secretNamespace: '<String>' } }).execute();
```
