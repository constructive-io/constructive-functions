# ORM Client

<p align="center" width="100%">
  <img height="120" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

## Setup

```typescript
import { createClient } from './orm';

const db = createClient({
  endpoint: 'https://api.example.com/graphql',
  headers: { Authorization: 'Bearer <token>' },
});
```

## Models

| Model | Operations |
|-------|------------|
| `platformSecretDefinition` | findMany, findOne, create, update, delete |
| `platformFunctionExecutionLog` | findMany, findOne, create, update, delete |
| `platformNamespace` | findMany, findOne, create, update, delete |
| `platformFunctionInvocation` | findMany, findOne, create, update, delete |
| `platformNamespaceEvent` | findMany, findOne, create, update, delete |
| `platformFunctionDefinition` | findMany, findOne, create, update, delete |

## Table Operations

### `db.platformSecretDefinition`

CRUD operations for PlatformSecretDefinition records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `isBuiltIn` | Boolean | Yes |
| `labels` | JSON | Yes |
| `name` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformSecretDefinition records
const items = await db.platformSecretDefinition.findMany({ select: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, isBuiltIn: true, labels: true, name: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformSecretDefinition.findOne({ id: '<UUID>', select: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, isBuiltIn: true, labels: true, name: true, updatedAt: true } }).execute();

// Create
const created = await db.platformSecretDefinition.create({ data: { annotations: '<JSON>', databaseId: '<UUID>', description: '<String>', isBuiltIn: '<Boolean>', labels: '<JSON>', name: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformSecretDefinition.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformSecretDefinition.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFunctionExecutionLog`

CRUD operations for PlatformFunctionExecutionLog records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `actorId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `invocationId` | UUID | Yes |
| `logLevel` | String | Yes |
| `message` | String | Yes |
| `metadata` | JSON | Yes |
| `taskIdentifier` | String | Yes |

**Operations:**

```typescript
// List all platformFunctionExecutionLog records
const items = await db.platformFunctionExecutionLog.findMany({ select: { createdAt: true, actorId: true, databaseId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } }).execute();

// Get one by id
const item = await db.platformFunctionExecutionLog.findOne({ id: '<UUID>', select: { createdAt: true, actorId: true, databaseId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } }).execute();

// Create
const created = await db.platformFunctionExecutionLog.create({ data: { actorId: '<UUID>', databaseId: '<UUID>', invocationId: '<UUID>', logLevel: '<String>', message: '<String>', metadata: '<JSON>', taskIdentifier: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionExecutionLog.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionExecutionLog.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformNamespace`

CRUD operations for PlatformNamespace records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `isActive` | Boolean | Yes |
| `labels` | JSON | Yes |
| `name` | String | Yes |
| `namespaceName` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformNamespace records
const items = await db.platformNamespace.findMany({ select: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, isActive: true, labels: true, name: true, namespaceName: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformNamespace.findOne({ id: '<UUID>', select: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, isActive: true, labels: true, name: true, namespaceName: true, updatedAt: true } }).execute();

// Create
const created = await db.platformNamespace.create({ data: { annotations: '<JSON>', databaseId: '<UUID>', description: '<String>', isActive: '<Boolean>', labels: '<JSON>', name: '<String>', namespaceName: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformNamespace.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformNamespace.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFunctionInvocation`

CRUD operations for PlatformFunctionInvocation records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `actorId` | UUID | Yes |
| `completedAt` | Datetime | Yes |
| `databaseId` | UUID | Yes |
| `durationMs` | Int | Yes |
| `error` | String | Yes |
| `functionId` | UUID | Yes |
| `id` | UUID | No |
| `jobId` | BigInt | Yes |
| `payload` | JSON | Yes |
| `result` | JSON | Yes |
| `startedAt` | Datetime | Yes |
| `status` | String | Yes |
| `taskIdentifier` | String | Yes |

**Operations:**

```typescript
// List all platformFunctionInvocation records
const items = await db.platformFunctionInvocation.findMany({ select: { createdAt: true, actorId: true, completedAt: true, databaseId: true, durationMs: true, error: true, functionId: true, id: true, jobId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } }).execute();

// Get one by id
const item = await db.platformFunctionInvocation.findOne({ id: '<UUID>', select: { createdAt: true, actorId: true, completedAt: true, databaseId: true, durationMs: true, error: true, functionId: true, id: true, jobId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } }).execute();

// Create
const created = await db.platformFunctionInvocation.create({ data: { actorId: '<UUID>', completedAt: '<Datetime>', databaseId: '<UUID>', durationMs: '<Int>', error: '<String>', functionId: '<UUID>', jobId: '<BigInt>', payload: '<JSON>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionInvocation.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionInvocation.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformNamespaceEvent`

CRUD operations for PlatformNamespaceEvent records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `actorId` | UUID | Yes |
| `cpuMillicores` | Int | Yes |
| `databaseId` | UUID | Yes |
| `eventType` | String | Yes |
| `id` | UUID | No |
| `memoryBytes` | BigInt | Yes |
| `message` | String | Yes |
| `metadata` | JSON | Yes |
| `metrics` | JSON | Yes |
| `namespaceId` | UUID | Yes |
| `networkEgressBytes` | BigInt | Yes |
| `networkIngressBytes` | BigInt | Yes |
| `podCount` | Int | Yes |
| `storageBytes` | BigInt | Yes |

**Operations:**

```typescript
// List all platformNamespaceEvent records
const items = await db.platformNamespaceEvent.findMany({ select: { createdAt: true, actorId: true, cpuMillicores: true, databaseId: true, eventType: true, id: true, memoryBytes: true, message: true, metadata: true, metrics: true, namespaceId: true, networkEgressBytes: true, networkIngressBytes: true, podCount: true, storageBytes: true } }).execute();

// Get one by id
const item = await db.platformNamespaceEvent.findOne({ id: '<UUID>', select: { createdAt: true, actorId: true, cpuMillicores: true, databaseId: true, eventType: true, id: true, memoryBytes: true, message: true, metadata: true, metrics: true, namespaceId: true, networkEgressBytes: true, networkIngressBytes: true, podCount: true, storageBytes: true } }).execute();

// Create
const created = await db.platformNamespaceEvent.create({ data: { actorId: '<UUID>', cpuMillicores: '<Int>', databaseId: '<UUID>', eventType: '<String>', memoryBytes: '<BigInt>', message: '<String>', metadata: '<JSON>', metrics: '<JSON>', namespaceId: '<UUID>', networkEgressBytes: '<BigInt>', networkIngressBytes: '<BigInt>', podCount: '<Int>', storageBytes: '<BigInt>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformNamespaceEvent.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformNamespaceEvent.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFunctionDefinition`

CRUD operations for PlatformFunctionDefinition records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `description` | String | Yes |
| `id` | UUID | No |
| `isBuiltIn` | Boolean | Yes |
| `isInvocable` | Boolean | Yes |
| `maxAttempts` | Int | Yes |
| `name` | String | Yes |
| `namespaceId` | UUID | Yes |
| `priority` | Int | Yes |
| `queueName` | String | Yes |
| `scope` | String | Yes |
| `serviceUrl` | String | Yes |
| `taskIdentifier` | String | Yes |
| `updatedAt` | Datetime | No |
| `payloadSchema` | JSON | Yes |
| `requiredConfigs` | FunctionRequirement | Yes |
| `requiredSecrets` | FunctionRequirement | Yes |

**Operations:**

```typescript
// List all platformFunctionDefinition records
const items = await db.platformFunctionDefinition.findMany({ select: { createdAt: true, description: true, id: true, isBuiltIn: true, isInvocable: true, maxAttempts: true, name: true, namespaceId: true, priority: true, queueName: true, scope: true, serviceUrl: true, taskIdentifier: true, updatedAt: true, payloadSchema: true, requiredConfigs: true, requiredSecrets: true } }).execute();

// Get one by id
const item = await db.platformFunctionDefinition.findOne({ id: '<UUID>', select: { createdAt: true, description: true, id: true, isBuiltIn: true, isInvocable: true, maxAttempts: true, name: true, namespaceId: true, priority: true, queueName: true, scope: true, serviceUrl: true, taskIdentifier: true, updatedAt: true, payloadSchema: true, requiredConfigs: true, requiredSecrets: true } }).execute();

// Create
const created = await db.platformFunctionDefinition.create({ data: { description: '<String>', isBuiltIn: '<Boolean>', isInvocable: '<Boolean>', maxAttempts: '<Int>', name: '<String>', namespaceId: '<UUID>', priority: '<Int>', queueName: '<String>', scope: '<String>', serviceUrl: '<String>', taskIdentifier: '<String>', payloadSchema: '<JSON>', requiredConfigs: '<FunctionRequirement>', requiredSecrets: '<FunctionRequirement>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionDefinition.update({ where: { id: '<UUID>' }, data: { description: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionDefinition.delete({ where: { id: '<UUID>' } }).execute();
```

## Custom Operations

### `db.mutation.provisionBucket`

Provision an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then creates and configures
the S3 bucket with the appropriate privacy policies, CORS rules,
and lifecycle settings.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionBucketInput (required) |

```typescript
const result = await db.mutation.provisionBucket({ input: { bucketKey: '<String>', ownerId: '<UUID>' } }).execute();
```

---

Built by the [Constructive](https://constructive.io) team.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
