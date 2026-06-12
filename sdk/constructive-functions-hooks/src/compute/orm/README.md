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
| `getAllRecord` | findMany, findOne, create, update, delete |
| `platformFunctionGraphRef` | findMany, findOne, create, update, delete |
| `platformFunctionGraphStore` | findMany, findOne, create, update, delete |
| `platformFunctionGraphObject` | findMany, findOne, create, update, delete |
| `orgFunctionExecutionLog` | findMany, findOne, create, update, delete |
| `platformFunctionGraphCommit` | findMany, findOne, create, update, delete |
| `platformSecretDefinition` | findMany, findOne, create, update, delete |
| `platformFunctionExecutionLog` | findMany, findOne, create, update, delete |
| `platformFunctionGraph` | findMany, findOne, create, update, delete |
| `platformComputeLog` | findMany, findOne, create, update, delete |
| `platformUsageDaily` | findMany, findOne, create, update, delete |
| `orgFunctionInvocation` | findMany, findOne, create, update, delete |
| `platformFunctionInvocation` | findMany, findOne, create, update, delete |
| `platformFunctionDefinition` | findMany, findOne, create, update, delete |

## Table Operations

### `db.getAllRecord`

CRUD operations for GetAllRecord records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `path` | String | Yes |
| `data` | JSON | Yes |

**Operations:**

```typescript
// List all getAllRecord records
const items = await db.getAllRecord.findMany({ select: { path: true, data: true } }).execute();

// Get one by id
const item = await db.getAllRecord.findOne({ id: '<UUID>', select: { path: true, data: true } }).execute();

// Create
const created = await db.getAllRecord.create({ data: { path: '<String>', data: '<JSON>' }, select: { id: true } }).execute();

// Update
const updated = await db.getAllRecord.update({ where: { id: '<UUID>' }, data: { path: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.getAllRecord.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFunctionGraphRef`

CRUD operations for PlatformFunctionGraphRef records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `commitId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `name` | String | Yes |
| `storeId` | UUID | Yes |

**Operations:**

```typescript
// List all platformFunctionGraphRef records
const items = await db.platformFunctionGraphRef.findMany({ select: { commitId: true, databaseId: true, id: true, name: true, storeId: true } }).execute();

// Get one by id
const item = await db.platformFunctionGraphRef.findOne({ id: '<UUID>', select: { commitId: true, databaseId: true, id: true, name: true, storeId: true } }).execute();

// Create
const created = await db.platformFunctionGraphRef.create({ data: { commitId: '<UUID>', databaseId: '<UUID>', name: '<String>', storeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionGraphRef.update({ where: { id: '<UUID>' }, data: { commitId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionGraphRef.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFunctionGraphStore`

CRUD operations for PlatformFunctionGraphStore records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `hash` | UUID | Yes |
| `id` | UUID | No |
| `name` | String | Yes |

**Operations:**

```typescript
// List all platformFunctionGraphStore records
const items = await db.platformFunctionGraphStore.findMany({ select: { createdAt: true, databaseId: true, hash: true, id: true, name: true } }).execute();

// Get one by id
const item = await db.platformFunctionGraphStore.findOne({ id: '<UUID>', select: { createdAt: true, databaseId: true, hash: true, id: true, name: true } }).execute();

// Create
const created = await db.platformFunctionGraphStore.create({ data: { databaseId: '<UUID>', hash: '<UUID>', name: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionGraphStore.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionGraphStore.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFunctionGraphObject`

CRUD operations for PlatformFunctionGraphObject records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `data` | JSON | Yes |
| `databaseId` | UUID | Yes |
| `id` | UUID | No |
| `kids` | UUID | Yes |
| `ktree` | String | Yes |

**Operations:**

```typescript
// List all platformFunctionGraphObject records
const items = await db.platformFunctionGraphObject.findMany({ select: { createdAt: true, data: true, databaseId: true, id: true, kids: true, ktree: true } }).execute();

// Get one by id
const item = await db.platformFunctionGraphObject.findOne({ id: '<UUID>', select: { createdAt: true, data: true, databaseId: true, id: true, kids: true, ktree: true } }).execute();

// Create
const created = await db.platformFunctionGraphObject.create({ data: { data: '<JSON>', databaseId: '<UUID>', kids: '<UUID>', ktree: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionGraphObject.update({ where: { id: '<UUID>' }, data: { data: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionGraphObject.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgFunctionExecutionLog`

CRUD operations for OrgFunctionExecutionLog records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `actorId` | UUID | Yes |
| `id` | UUID | No |
| `invocationId` | UUID | Yes |
| `logLevel` | String | Yes |
| `message` | String | Yes |
| `metadata` | JSON | Yes |
| `taskIdentifier` | String | Yes |

**Operations:**

```typescript
// List all orgFunctionExecutionLog records
const items = await db.orgFunctionExecutionLog.findMany({ select: { createdAt: true, actorId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } }).execute();

// Get one by id
const item = await db.orgFunctionExecutionLog.findOne({ id: '<UUID>', select: { createdAt: true, actorId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } }).execute();

// Create
const created = await db.orgFunctionExecutionLog.create({ data: { actorId: '<UUID>', invocationId: '<UUID>', logLevel: '<String>', message: '<String>', metadata: '<JSON>', taskIdentifier: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgFunctionExecutionLog.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgFunctionExecutionLog.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFunctionGraphCommit`

CRUD operations for PlatformFunctionGraphCommit records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `authorId` | UUID | Yes |
| `committerId` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `date` | Datetime | Yes |
| `id` | UUID | No |
| `message` | String | Yes |
| `parentIds` | UUID | Yes |
| `storeId` | UUID | Yes |
| `treeId` | UUID | Yes |

**Operations:**

```typescript
// List all platformFunctionGraphCommit records
const items = await db.platformFunctionGraphCommit.findMany({ select: { authorId: true, committerId: true, databaseId: true, date: true, id: true, message: true, parentIds: true, storeId: true, treeId: true } }).execute();

// Get one by id
const item = await db.platformFunctionGraphCommit.findOne({ id: '<UUID>', select: { authorId: true, committerId: true, databaseId: true, date: true, id: true, message: true, parentIds: true, storeId: true, treeId: true } }).execute();

// Create
const created = await db.platformFunctionGraphCommit.create({ data: { authorId: '<UUID>', committerId: '<UUID>', databaseId: '<UUID>', date: '<Datetime>', message: '<String>', parentIds: '<UUID>', storeId: '<UUID>', treeId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionGraphCommit.update({ where: { id: '<UUID>' }, data: { authorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionGraphCommit.delete({ where: { id: '<UUID>' } }).execute();
```

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

### `db.platformFunctionGraph`

CRUD operations for PlatformFunctionGraph records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `context` | String | Yes |
| `createdAt` | Datetime | No |
| `createdBy` | UUID | Yes |
| `databaseId` | UUID | Yes |
| `definitionsCommitId` | UUID | Yes |
| `description` | String | Yes |
| `entityId` | UUID | Yes |
| `id` | UUID | No |
| `isValid` | Boolean | Yes |
| `name` | String | Yes |
| `storeId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `validationErrors` | JSON | Yes |

**Operations:**

```typescript
// List all platformFunctionGraph records
const items = await db.platformFunctionGraph.findMany({ select: { context: true, createdAt: true, createdBy: true, databaseId: true, definitionsCommitId: true, description: true, entityId: true, id: true, isValid: true, name: true, storeId: true, updatedAt: true, validationErrors: true } }).execute();

// Get one by id
const item = await db.platformFunctionGraph.findOne({ id: '<UUID>', select: { context: true, createdAt: true, createdBy: true, databaseId: true, definitionsCommitId: true, description: true, entityId: true, id: true, isValid: true, name: true, storeId: true, updatedAt: true, validationErrors: true } }).execute();

// Create
const created = await db.platformFunctionGraph.create({ data: { context: '<String>', createdBy: '<UUID>', databaseId: '<UUID>', definitionsCommitId: '<UUID>', description: '<String>', entityId: '<UUID>', isValid: '<Boolean>', name: '<String>', storeId: '<UUID>', validationErrors: '<JSON>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionGraph.update({ where: { id: '<UUID>' }, data: { context: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionGraph.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformComputeLog`

CRUD operations for PlatformComputeLog records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `completedAt` | Datetime | Yes |
| `id` | UUID | No |
| `databaseId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `organizationId` | UUID | Yes |
| `entityType` | String | Yes |
| `actorId` | UUID | Yes |
| `taskIdentifier` | String | Yes |
| `jobId` | BigInt | Yes |
| `invocationId` | UUID | Yes |
| `status` | String | Yes |
| `durationMs` | Int | Yes |
| `error` | String | Yes |

**Operations:**

```typescript
// List all platformComputeLog records
const items = await db.platformComputeLog.findMany({ select: { completedAt: true, id: true, databaseId: true, entityId: true, organizationId: true, entityType: true, actorId: true, taskIdentifier: true, jobId: true, invocationId: true, status: true, durationMs: true, error: true } }).execute();

// Get one by id
const item = await db.platformComputeLog.findOne({ id: '<UUID>', select: { completedAt: true, id: true, databaseId: true, entityId: true, organizationId: true, entityType: true, actorId: true, taskIdentifier: true, jobId: true, invocationId: true, status: true, durationMs: true, error: true } }).execute();

// Create
const created = await db.platformComputeLog.create({ data: { completedAt: '<Datetime>', databaseId: '<UUID>', entityId: '<UUID>', organizationId: '<UUID>', entityType: '<String>', actorId: '<UUID>', taskIdentifier: '<String>', jobId: '<BigInt>', invocationId: '<UUID>', status: '<String>', durationMs: '<Int>', error: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformComputeLog.update({ where: { id: '<UUID>' }, data: { completedAt: '<Datetime>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformComputeLog.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformUsageDaily`

CRUD operations for PlatformUsageDaily records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `databaseId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `organizationId` | UUID | Yes |
| `entityType` | String | Yes |
| `taskIdentifier` | String | Yes |
| `date` | Date | Yes |
| `totalCalls` | BigInt | Yes |
| `successful` | BigInt | Yes |
| `failed` | BigInt | Yes |
| `totalDurationMs` | BigInt | Yes |
| `minDurationMs` | Int | Yes |
| `maxDurationMs` | Int | Yes |

**Operations:**

```typescript
// List all platformUsageDaily records
const items = await db.platformUsageDaily.findMany({ select: { id: true, databaseId: true, entityId: true, organizationId: true, entityType: true, taskIdentifier: true, date: true, totalCalls: true, successful: true, failed: true, totalDurationMs: true, minDurationMs: true, maxDurationMs: true } }).execute();

// Get one by id
const item = await db.platformUsageDaily.findOne({ id: '<UUID>', select: { id: true, databaseId: true, entityId: true, organizationId: true, entityType: true, taskIdentifier: true, date: true, totalCalls: true, successful: true, failed: true, totalDurationMs: true, minDurationMs: true, maxDurationMs: true } }).execute();

// Create
const created = await db.platformUsageDaily.create({ data: { databaseId: '<UUID>', entityId: '<UUID>', organizationId: '<UUID>', entityType: '<String>', taskIdentifier: '<String>', date: '<Date>', totalCalls: '<BigInt>', successful: '<BigInt>', failed: '<BigInt>', totalDurationMs: '<BigInt>', minDurationMs: '<Int>', maxDurationMs: '<Int>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformUsageDaily.update({ where: { id: '<UUID>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformUsageDaily.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.orgFunctionInvocation`

CRUD operations for OrgFunctionInvocation records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `actorId` | UUID | Yes |
| `completedAt` | Datetime | Yes |
| `durationMs` | Int | Yes |
| `error` | String | Yes |
| `graphExecutionId` | UUID | Yes |
| `id` | UUID | No |
| `jobId` | BigInt | Yes |
| `parentInvocationId` | UUID | Yes |
| `payload` | JSON | Yes |
| `result` | JSON | Yes |
| `startedAt` | Datetime | Yes |
| `status` | String | Yes |
| `taskIdentifier` | String | Yes |

**Operations:**

```typescript
// List all orgFunctionInvocation records
const items = await db.orgFunctionInvocation.findMany({ select: { createdAt: true, actorId: true, completedAt: true, durationMs: true, error: true, graphExecutionId: true, id: true, jobId: true, parentInvocationId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } }).execute();

// Get one by id
const item = await db.orgFunctionInvocation.findOne({ id: '<UUID>', select: { createdAt: true, actorId: true, completedAt: true, durationMs: true, error: true, graphExecutionId: true, id: true, jobId: true, parentInvocationId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } }).execute();

// Create
const created = await db.orgFunctionInvocation.create({ data: { actorId: '<UUID>', completedAt: '<Datetime>', durationMs: '<Int>', error: '<String>', graphExecutionId: '<UUID>', jobId: '<BigInt>', parentInvocationId: '<UUID>', payload: '<JSON>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.orgFunctionInvocation.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.orgFunctionInvocation.delete({ where: { id: '<UUID>' } }).execute();
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
| `graphExecutionId` | UUID | Yes |
| `id` | UUID | No |
| `jobId` | BigInt | Yes |
| `parentInvocationId` | UUID | Yes |
| `payload` | JSON | Yes |
| `result` | JSON | Yes |
| `startedAt` | Datetime | Yes |
| `status` | String | Yes |
| `taskIdentifier` | String | Yes |

**Operations:**

```typescript
// List all platformFunctionInvocation records
const items = await db.platformFunctionInvocation.findMany({ select: { createdAt: true, actorId: true, completedAt: true, databaseId: true, durationMs: true, error: true, graphExecutionId: true, id: true, jobId: true, parentInvocationId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } }).execute();

// Get one by id
const item = await db.platformFunctionInvocation.findOne({ id: '<UUID>', select: { createdAt: true, actorId: true, completedAt: true, databaseId: true, durationMs: true, error: true, graphExecutionId: true, id: true, jobId: true, parentInvocationId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } }).execute();

// Create
const created = await db.platformFunctionInvocation.create({ data: { actorId: '<UUID>', completedAt: '<Datetime>', databaseId: '<UUID>', durationMs: '<Int>', error: '<String>', graphExecutionId: '<UUID>', jobId: '<BigInt>', parentInvocationId: '<UUID>', payload: '<JSON>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionInvocation.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionInvocation.delete({ where: { id: '<UUID>' } }).execute();
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
| `requiredConfigs` | FunctionRequirement | Yes |
| `requiredSecrets` | FunctionRequirement | Yes |

**Operations:**

```typescript
// List all platformFunctionDefinition records
const items = await db.platformFunctionDefinition.findMany({ select: { createdAt: true, description: true, id: true, isBuiltIn: true, isInvocable: true, maxAttempts: true, name: true, namespaceId: true, priority: true, queueName: true, scope: true, serviceUrl: true, taskIdentifier: true, updatedAt: true, requiredConfigs: true, requiredSecrets: true } }).execute();

// Get one by id
const item = await db.platformFunctionDefinition.findOne({ id: '<UUID>', select: { createdAt: true, description: true, id: true, isBuiltIn: true, isInvocable: true, maxAttempts: true, name: true, namespaceId: true, priority: true, queueName: true, scope: true, serviceUrl: true, taskIdentifier: true, updatedAt: true, requiredConfigs: true, requiredSecrets: true } }).execute();

// Create
const created = await db.platformFunctionDefinition.create({ data: { description: '<String>', isBuiltIn: '<Boolean>', isInvocable: '<Boolean>', maxAttempts: '<Int>', name: '<String>', namespaceId: '<UUID>', priority: '<Int>', queueName: '<String>', scope: '<String>', serviceUrl: '<String>', taskIdentifier: '<String>', requiredConfigs: '<FunctionRequirement>', requiredSecrets: '<FunctionRequirement>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFunctionDefinition.update({ where: { id: '<UUID>' }, data: { description: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFunctionDefinition.delete({ where: { id: '<UUID>' } }).execute();
```

## Custom Operations

### `db.query.platformReadFunctionGraph`

platformReadFunctionGraph

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `graphId` | UUID |

```typescript
const result = await db.query.platformReadFunctionGraph({ graphId: '<UUID>' }).execute();
```

### `db.mutation.platformValidateFunctionGraph`

platformValidateFunctionGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformValidateFunctionGraphInput (required) |

```typescript
const result = await db.mutation.platformValidateFunctionGraph({ input: { graphId: '<UUID>' } }).execute();
```

### `db.mutation.initEmptyRepo`

initEmptyRepo

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InitEmptyRepoInput (required) |

```typescript
const result = await db.mutation.initEmptyRepo({ input: { sId: '<UUID>', storeId: '<UUID>' } }).execute();
```

### `db.mutation.platformImportDefinitions`

platformImportDefinitions

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformImportDefinitionsInput (required) |

```typescript
const result = await db.mutation.platformImportDefinitions({ input: { graphId: '<UUID>', sourceScopeId: '<UUID>', sourceCommitId: '<UUID>', contexts: '<String>' } }).execute();
```

### `db.mutation.setDataAtPath`

setDataAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SetDataAtPathInput (required) |

```typescript
const result = await db.mutation.setDataAtPath({ input: { sId: '<UUID>', root: '<UUID>', path: '<String>', data: '<JSON>' } }).execute();
```

### `db.mutation.platformCopyGraph`

platformCopyGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformCopyGraphInput (required) |

```typescript
const result = await db.mutation.platformCopyGraph({ input: { databaseId: '<UUID>', graphId: '<UUID>', name: '<String>' } }).execute();
```

### `db.mutation.platformSaveGraph`

platformSaveGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformSaveGraphInput (required) |

```typescript
const result = await db.mutation.platformSaveGraph({ input: { graphId: '<UUID>', rootHash: '<UUID>', message: '<String>' } }).execute();
```

### `db.mutation.platformAddEdgeAndSave`

platformAddEdgeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformAddEdgeAndSaveInput (required) |

```typescript
const result = await db.mutation.platformAddEdgeAndSave({ input: '<PlatformAddEdgeAndSaveInput>' }).execute();
```

### `db.mutation.platformAddNodeAndSave`

platformAddNodeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformAddNodeAndSaveInput (required) |

```typescript
const result = await db.mutation.platformAddNodeAndSave({ input: '<PlatformAddNodeAndSaveInput>' }).execute();
```

### `db.mutation.platformCreateFunctionGraph`

platformCreateFunctionGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformCreateFunctionGraphInput (required) |

```typescript
const result = await db.mutation.platformCreateFunctionGraph({ input: '<PlatformCreateFunctionGraphInput>' }).execute();
```

### `db.mutation.platformAddEdge`

platformAddEdge

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformAddEdgeInput (required) |

```typescript
const result = await db.mutation.platformAddEdge({ input: '<PlatformAddEdgeInput>' }).execute();
```

### `db.mutation.platformAddNode`

platformAddNode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformAddNodeInput (required) |

```typescript
const result = await db.mutation.platformAddNode({ input: '<PlatformAddNodeInput>' }).execute();
```

### `db.mutation.platformImportGraphJson`

platformImportGraphJson

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformImportGraphJsonInput (required) |

```typescript
const result = await db.mutation.platformImportGraphJson({ input: '<PlatformImportGraphJsonInput>' }).execute();
```

### `db.mutation.insertNodeAtPath`

insertNodeAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InsertNodeAtPathInput (required) |

```typescript
const result = await db.mutation.insertNodeAtPath({ input: '<InsertNodeAtPathInput>' }).execute();
```

### `db.mutation.platformStartExecution`

platformStartExecution

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformStartExecutionInput (required) |

```typescript
const result = await db.mutation.platformStartExecution({ input: '<PlatformStartExecutionInput>' }).execute();
```

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
