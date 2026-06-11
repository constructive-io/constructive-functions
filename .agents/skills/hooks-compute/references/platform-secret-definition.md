# platformSecretDefinition

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Global secret name registry — declares which secrets the platform recognizes. Actual values live in app_secrets.

## Usage

```typescript
usePlatformSecretDefinitionsQuery({ selection: { fields: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, isBuiltIn: true, labels: true, name: true, updatedAt: true } } })
usePlatformSecretDefinitionQuery({ id: '<UUID>', selection: { fields: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, isBuiltIn: true, labels: true, name: true, updatedAt: true } } })
useCreatePlatformSecretDefinitionMutation({ selection: { fields: { id: true } } })
useUpdatePlatformSecretDefinitionMutation({ selection: { fields: { id: true } } })
useDeletePlatformSecretDefinitionMutation({})
```

## Examples

### List all platformSecretDefinitions

```typescript
const { data, isLoading } = usePlatformSecretDefinitionsQuery({
  selection: { fields: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, isBuiltIn: true, labels: true, name: true, updatedAt: true } },
});
```

### Create a platformSecretDefinition

```typescript
const { mutate } = useCreatePlatformSecretDefinitionMutation({
  selection: { fields: { id: true } },
});
mutate({ annotations: '<JSON>', databaseId: '<UUID>', description: '<String>', isBuiltIn: '<Boolean>', labels: '<JSON>', name: '<String>' });
```
