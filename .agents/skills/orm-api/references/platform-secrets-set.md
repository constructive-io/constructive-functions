# platformSecretsSet

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Execute the platformSecretsSet mutation

## Usage

```typescript
db.mutation.platformSecretsSet({ input: { secretName: '<String>', secretValue: '<String>', algo: '<String>', secretNamespace: '<String>' } }).execute()
```

## Examples

### Run platformSecretsSet

```typescript
const result = await db.mutation.platformSecretsSet({ input: { secretName: '<String>', secretValue: '<String>', algo: '<String>', secretNamespace: '<String>' } }).execute();
```
