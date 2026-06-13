# platformSecretDefinition

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Global secret name registry — declares which secrets the platform recognizes. Actual values live in app_secrets.

## Usage

```typescript
db.platformSecretDefinition.findMany({ select: { id: true } }).execute()
db.platformSecretDefinition.findOne({ id: '<UUID>', select: { id: true } }).execute()
db.platformSecretDefinition.create({ data: { annotations: '<JSON>', databaseId: '<UUID>', description: '<String>', isBuiltIn: '<Boolean>', labels: '<JSON>', name: '<String>' }, select: { id: true } }).execute()
db.platformSecretDefinition.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute()
db.platformSecretDefinition.delete({ where: { id: '<UUID>' } }).execute()
```

## Examples

### List all platformSecretDefinition records

```typescript
const items = await db.platformSecretDefinition.findMany({
  select: { id: true, annotations: true }
}).execute();
```

### Create a platformSecretDefinition

```typescript
const item = await db.platformSecretDefinition.create({
  data: { annotations: '<JSON>', databaseId: '<UUID>', description: '<String>', isBuiltIn: '<Boolean>', labels: '<JSON>', name: '<String>' },
  select: { id: true }
}).execute();
```
