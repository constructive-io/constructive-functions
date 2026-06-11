# platformConfigDefinition

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Registry of valid config keys — declares which config entries the platform recognizes

## Usage

```typescript
usePlatformConfigDefinitionsQuery({ selection: { fields: { annotations: true, createdAt: true, defaultValue: true, description: true, id: true, isBuiltIn: true, labels: true, name: true, updatedAt: true } } })
usePlatformConfigDefinitionQuery({ id: '<UUID>', selection: { fields: { annotations: true, createdAt: true, defaultValue: true, description: true, id: true, isBuiltIn: true, labels: true, name: true, updatedAt: true } } })
useCreatePlatformConfigDefinitionMutation({ selection: { fields: { id: true } } })
useUpdatePlatformConfigDefinitionMutation({ selection: { fields: { id: true } } })
useDeletePlatformConfigDefinitionMutation({})
```

## Examples

### List all platformConfigDefinitions

```typescript
const { data, isLoading } = usePlatformConfigDefinitionsQuery({
  selection: { fields: { annotations: true, createdAt: true, defaultValue: true, description: true, id: true, isBuiltIn: true, labels: true, name: true, updatedAt: true } },
});
```

### Create a platformConfigDefinition

```typescript
const { mutate } = useCreatePlatformConfigDefinitionMutation({
  selection: { fields: { id: true } },
});
mutate({ annotations: '<JSON>', defaultValue: '<String>', description: '<String>', isBuiltIn: '<Boolean>', labels: '<JSON>', name: '<String>' });
```
