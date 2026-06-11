# platformFunctionDefinition

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Function definitions — registered cloud functions with routing, queue, and retry configuration

## Usage

```typescript
db.platformFunctionDefinition.findMany({ select: { id: true } }).execute()
db.platformFunctionDefinition.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformFunctionDefinition.create({ data: { description: '<String>', isBuiltIn: '<Boolean>', isInvocable: '<Boolean>', maxAttempts: '<Int>', name: '<String>', namespaceId: '<UUID>', priority: '<Int>', queueName: '<String>', scope: '<String>', serviceUrl: '<String>', taskIdentifier: '<String>', requiredConfigs: '<FunctionRequirement>', requiredSecrets: '<FunctionRequirement>' }, select: { id: true } }).execute()
db.platformFunctionDefinition.update({ where: { id: '<UUID>' }, data: { description: '<String>' }, select: { id: true } }).execute()
db.platformFunctionDefinition.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformFunctionDefinition records

```typescript
const items = await db.platformFunctionDefinition.findMany({
  select: { id: true, description: true }
}).execute();
```

### Create a platformFunctionDefinition

```typescript
const item = await db.platformFunctionDefinition.create({
  data: { description: '<String>', isBuiltIn: '<Boolean>', isInvocable: '<Boolean>', maxAttempts: '<Int>', name: '<String>', namespaceId: '<UUID>', priority: '<Int>', queueName: '<String>', scope: '<String>', serviceUrl: '<String>', taskIdentifier: '<String>', requiredConfigs: '<FunctionRequirement>', requiredSecrets: '<FunctionRequirement>' },
  select: { id: true }
}).execute();
```
