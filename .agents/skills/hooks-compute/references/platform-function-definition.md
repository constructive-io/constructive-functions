# platformFunctionDefinition

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Function definitions — registered cloud functions with routing, queue, and retry configuration

## Usage

```typescript
usePlatformFunctionDefinitionsQuery({ selection: { fields: { createdAt: true, description: true, id: true, isBuiltIn: true, isInvocable: true, maxAttempts: true, name: true, namespaceId: true, priority: true, queueName: true, scope: true, serviceUrl: true, taskIdentifier: true, updatedAt: true, requiredConfigs: true, requiredSecrets: true } } })
usePlatformFunctionDefinitionQuery({ id: '<UUID>', selection: { fields: { createdAt: true, description: true, id: true, isBuiltIn: true, isInvocable: true, maxAttempts: true, name: true, namespaceId: true, priority: true, queueName: true, scope: true, serviceUrl: true, taskIdentifier: true, updatedAt: true, requiredConfigs: true, requiredSecrets: true } } })
useCreatePlatformFunctionDefinitionMutation({ selection: { fields: { id: true } } })
useUpdatePlatformFunctionDefinitionMutation({ selection: { fields: { id: true } } })
useDeletePlatformFunctionDefinitionMutation({})
```

## Examples

### List all platformFunctionDefinitions

```typescript
const { data, isLoading } = usePlatformFunctionDefinitionsQuery({
  selection: { fields: { createdAt: true, description: true, id: true, isBuiltIn: true, isInvocable: true, maxAttempts: true, name: true, namespaceId: true, priority: true, queueName: true, scope: true, serviceUrl: true, taskIdentifier: true, updatedAt: true, requiredConfigs: true, requiredSecrets: true } },
});
```

### Create a platformFunctionDefinition

```typescript
const { mutate } = useCreatePlatformFunctionDefinitionMutation({
  selection: { fields: { id: true } },
});
mutate({ description: '<String>', isBuiltIn: '<Boolean>', isInvocable: '<Boolean>', maxAttempts: '<Int>', name: '<String>', namespaceId: '<UUID>', priority: '<Int>', queueName: '<String>', scope: '<String>', serviceUrl: '<String>', taskIdentifier: '<String>', requiredConfigs: '<FunctionRequirement>', requiredSecrets: '<FunctionRequirement>' });
```
