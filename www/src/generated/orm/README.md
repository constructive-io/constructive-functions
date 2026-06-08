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
| `platformSecretValue` | findMany, findOne, create, update, delete |
| `jobQueue` | findMany, findOne, create, update, delete |
| `platformFunctionExecutionLog` | findMany, findOne, create, update, delete |
| `platformSecretDefinition` | findMany, findOne, create, update, delete |
| `platformNamespace` | findMany, findOne, create, update, delete |
| `platformFunctionInvocation` | findMany, findOne, create, update, delete |
| `scheduledJob` | findMany, findOne, create, update, delete |
| `platformNamespaceEvent` | findMany, findOne, create, update, delete |
| `job` | findMany, findOne, create, update, delete |
| `platformFunctionDefinition` | findMany, findOne, create, update, delete |

## Table Operations

### `db.platformSecretValue`

CRUD operations for PlatformSecretValue records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | UUID | No |
| `secretName` | String | Yes |
| `configuredValue` | String | Yes |
| `databaseId` | UUID | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformSecretValue records
const items = await db.platformSecretValue.findMany({ select: { id: true, secretName: true, configuredValue: true, databaseId: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformSecretValue.findOne({ id: '<UUID>', select: { id: true, secretName: true, configuredValue: true, databaseId: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.platformSecretValue.create({ data: { secretName: '<String>', configuredValue: '<String>', databaseId: '<UUID>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformSecretValue.update({ where: { id: '<UUID>' }, data: { secretName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformSecretValue.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.jobQueue`

CRUD operations for JobQueue records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `queueName` | String | No |
| `jobCount` | Int | Yes |
| `lockedAt` | Datetime | Yes |
| `lockedBy` | String | Yes |

**Operations:**

```typescript
// List all jobQueue records
const items = await db.jobQueue.findMany({ select: { queueName: true, jobCount: true, lockedAt: true, lockedBy: true } }).execute();

// Get one by queueName
const item = await db.jobQueue.findOne({ queueName: '<String>', select: { queueName: true, jobCount: true, lockedAt: true, lockedBy: true } }).execute();

// Create
const created = await db.jobQueue.create({ data: { jobCount: '<Int>', lockedAt: '<Datetime>', lockedBy: '<String>' }, select: { queueName: true } }).execute();

// Update
const updated = await db.jobQueue.update({ where: { queueName: '<String>' }, data: { jobCount: '<Int>' }, select: { queueName: true } }).execute();

// Delete
const deleted = await db.jobQueue.delete({ where: { queueName: '<String>' } }).execute();
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

### `db.scheduledJob`

CRUD operations for ScheduledJob records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | BigInt | No |
| `databaseId` | UUID | Yes |
| `actorId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `queueName` | String | Yes |
| `taskIdentifier` | String | Yes |
| `payload` | JSON | Yes |
| `priority` | Int | Yes |
| `maxAttempts` | Int | Yes |
| `key` | String | Yes |
| `lockedAt` | Datetime | Yes |
| `lockedBy` | String | Yes |
| `scheduleInfo` | JSON | Yes |
| `lastScheduled` | Datetime | Yes |
| `lastScheduledId` | BigInt | Yes |

**Operations:**

```typescript
// List all scheduledJob records
const items = await db.scheduledJob.findMany({ select: { id: true, databaseId: true, actorId: true, entityId: true, queueName: true, taskIdentifier: true, payload: true, priority: true, maxAttempts: true, key: true, lockedAt: true, lockedBy: true, scheduleInfo: true, lastScheduled: true, lastScheduledId: true } }).execute();

// Get one by id
const item = await db.scheduledJob.findOne({ id: '<BigInt>', select: { id: true, databaseId: true, actorId: true, entityId: true, queueName: true, taskIdentifier: true, payload: true, priority: true, maxAttempts: true, key: true, lockedAt: true, lockedBy: true, scheduleInfo: true, lastScheduled: true, lastScheduledId: true } }).execute();

// Create
const created = await db.scheduledJob.create({ data: { databaseId: '<UUID>', actorId: '<UUID>', entityId: '<UUID>', queueName: '<String>', taskIdentifier: '<String>', payload: '<JSON>', priority: '<Int>', maxAttempts: '<Int>', key: '<String>', lockedAt: '<Datetime>', lockedBy: '<String>', scheduleInfo: '<JSON>', lastScheduled: '<Datetime>', lastScheduledId: '<BigInt>' }, select: { id: true } }).execute();

// Update
const updated = await db.scheduledJob.update({ where: { id: '<BigInt>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.scheduledJob.delete({ where: { id: '<BigInt>' } }).execute();
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

### `db.job`

CRUD operations for Job records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | BigInt | No |
| `databaseId` | UUID | Yes |
| `actorId` | UUID | Yes |
| `entityId` | UUID | Yes |
| `organizationId` | UUID | Yes |
| `entityType` | String | Yes |
| `queueName` | String | Yes |
| `taskIdentifier` | String | Yes |
| `payload` | JSON | Yes |
| `priority` | Int | Yes |
| `runAt` | Datetime | Yes |
| `attempts` | Int | Yes |
| `maxAttempts` | Int | Yes |
| `key` | String | Yes |
| `lastError` | String | Yes |
| `lockedAt` | Datetime | Yes |
| `lockedBy` | String | Yes |
| `isAvailable` | Boolean | Yes |
| `createdAt` | Datetime | No |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all job records
const items = await db.job.findMany({ select: { id: true, databaseId: true, actorId: true, entityId: true, organizationId: true, entityType: true, queueName: true, taskIdentifier: true, payload: true, priority: true, runAt: true, attempts: true, maxAttempts: true, key: true, lastError: true, lockedAt: true, lockedBy: true, isAvailable: true, createdAt: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.job.findOne({ id: '<BigInt>', select: { id: true, databaseId: true, actorId: true, entityId: true, organizationId: true, entityType: true, queueName: true, taskIdentifier: true, payload: true, priority: true, runAt: true, attempts: true, maxAttempts: true, key: true, lastError: true, lockedAt: true, lockedBy: true, isAvailable: true, createdAt: true, updatedAt: true } }).execute();

// Create
const created = await db.job.create({ data: { databaseId: '<UUID>', actorId: '<UUID>', entityId: '<UUID>', organizationId: '<UUID>', entityType: '<String>', queueName: '<String>', taskIdentifier: '<String>', payload: '<JSON>', priority: '<Int>', runAt: '<Datetime>', attempts: '<Int>', maxAttempts: '<Int>', key: '<String>', lastError: '<String>', lockedAt: '<Datetime>', lockedBy: '<String>', isAvailable: '<Boolean>' }, select: { id: true } }).execute();

// Update
const updated = await db.job.update({ where: { id: '<BigInt>' }, data: { databaseId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.job.delete({ where: { id: '<BigInt>' } }).execute();
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

### `db.mutation.releaseJobs`

releaseJobs

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ReleaseJobsInput (required) |

```typescript
const result = await db.mutation.releaseJobs({ input: { workerId: '<String>' } }).execute();
```

### `db.mutation.forceUnlockWorkers`

forceUnlockWorkers

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ForceUnlockWorkersInput (required) |

```typescript
const result = await db.mutation.forceUnlockWorkers({ input: { workerIds: '<String>' } }).execute();
```

### `db.mutation.jsonBuildObjectApply`

jsonBuildObjectApply

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | JsonBuildObjectApplyInput (required) |

```typescript
const result = await db.mutation.jsonBuildObjectApply({ input: { arguments: '<String>' } }).execute();
```

### `db.mutation.releaseScheduledJobs`

releaseScheduledJobs

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ReleaseScheduledJobsInput (required) |

```typescript
const result = await db.mutation.releaseScheduledJobs({ input: { workerId: '<String>', ids: '<BigInt>' } }).execute();
```

### `db.mutation.getScheduledJob`

getScheduledJob

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | GetScheduledJobInput (required) |

```typescript
const result = await db.mutation.getScheduledJob({ input: { workerId: '<String>', taskIdentifiers: '<String>' } }).execute();
```

### `db.mutation.addScheduledJob`

addScheduledJob

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AddScheduledJobInput (required) |

```typescript
const result = await db.mutation.addScheduledJob({ input: '<AddScheduledJobInput>' }).execute();
```

### `db.mutation.completeJobs`

completeJobs

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CompleteJobsInput (required) |

```typescript
const result = await db.mutation.completeJobs({ input: { jobIds: '<BigInt>' } }).execute();
```

### `db.mutation.removeJob`

removeJob

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RemoveJobInput (required) |

```typescript
const result = await db.mutation.removeJob({ input: { jobKey: '<String>' } }).execute();
```

### `db.mutation.completeJob`

completeJob

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CompleteJobInput (required) |

```typescript
const result = await db.mutation.completeJob({ input: { workerId: '<String>', jobId: '<BigInt>' } }).execute();
```

### `db.mutation.permanentlyFailJobs`

permanentlyFailJobs

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PermanentlyFailJobsInput (required) |

```typescript
const result = await db.mutation.permanentlyFailJobs({ input: { jobIds: '<BigInt>', errorMessage: '<String>' } }).execute();
```

### `db.mutation.failJob`

failJob

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | FailJobInput (required) |

```typescript
const result = await db.mutation.failJob({ input: { workerId: '<String>', jobId: '<BigInt>', errorMessage: '<String>' } }).execute();
```

### `db.mutation.rescheduleJobs`

rescheduleJobs

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RescheduleJobsInput (required) |

```typescript
const result = await db.mutation.rescheduleJobs({ input: { jobIds: '<BigInt>', runAt: '<Datetime>', priority: '<Int>', attempts: '<Int>', maxAttempts: '<Int>' } }).execute();
```

### `db.mutation.addJob`

addJob

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AddJobInput (required) |

```typescript
const result = await db.mutation.addJob({ input: '<AddJobInput>' }).execute();
```

### `db.mutation.runScheduledJob`

runScheduledJob

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RunScheduledJobInput (required) |

```typescript
const result = await db.mutation.runScheduledJob({ input: { id: '<BigInt>', jobExpiry: '<IntervalInput>' } }).execute();
```

### `db.mutation.getJob`

getJob

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | GetJobInput (required) |

```typescript
const result = await db.mutation.getJob({ input: { workerId: '<String>', taskIdentifiers: '<String>', jobExpiry: '<IntervalInput>' } }).execute();
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
