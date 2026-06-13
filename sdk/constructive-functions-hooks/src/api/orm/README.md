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
| `roleType` | findMany, findOne, create, update, delete |
| `platformConfigDefinition` | findMany, findOne, create, update, delete |
| `platformNamespace` | findMany, findOne, create, update, delete |
| `platformConfig` | findMany, findOne, create, update, delete |
| `platformBucket` | findMany, findOne, create, update, delete |
| `platformFile` | findMany, findOne, create, update, delete |
| `user` | findMany, findOne, create, update, delete |
| `platformNamespaceEvent` | findMany, findOne, create, update, delete |

## Table Operations

### `db.roleType`

CRUD operations for RoleType records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `id` | Int | No |
| `name` | String | Yes |

**Operations:**

```typescript
// List all roleType records
const items = await db.roleType.findMany({ select: { id: true, name: true } }).execute();

// Get one by id
const item = await db.roleType.findOne({ id: '<Int>', select: { id: true, name: true } }).execute();

// Create
const created = await db.roleType.create({ data: { name: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.roleType.update({ where: { id: '<Int>' }, data: { name: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.roleType.delete({ where: { id: '<Int>' } }).execute();
```

### `db.platformConfigDefinition`

CRUD operations for PlatformConfigDefinition records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `createdAt` | Datetime | No |
| `defaultValue` | String | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `isBuiltIn` | Boolean | Yes |
| `labels` | JSON | Yes |
| `name` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformConfigDefinition records
const items = await db.platformConfigDefinition.findMany({ select: { annotations: true, createdAt: true, defaultValue: true, description: true, id: true, isBuiltIn: true, labels: true, name: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformConfigDefinition.findOne({ id: '<UUID>', select: { annotations: true, createdAt: true, defaultValue: true, description: true, id: true, isBuiltIn: true, labels: true, name: true, updatedAt: true } }).execute();

// Create
const created = await db.platformConfigDefinition.create({ data: { annotations: '<JSON>', defaultValue: '<String>', description: '<String>', isBuiltIn: '<Boolean>', labels: '<JSON>', name: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformConfigDefinition.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformConfigDefinition.delete({ where: { id: '<UUID>' } }).execute();
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

### `db.platformConfig`

CRUD operations for PlatformConfig records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `annotations` | JSON | Yes |
| `createdAt` | Datetime | No |
| `description` | String | Yes |
| `expiresAt` | Datetime | Yes |
| `id` | UUID | No |
| `labels` | JSON | Yes |
| `name` | String | Yes |
| `namespaceId` | UUID | Yes |
| `updatedAt` | Datetime | No |
| `value` | String | Yes |

**Operations:**

```typescript
// List all platformConfig records
const items = await db.platformConfig.findMany({ select: { annotations: true, createdAt: true, description: true, expiresAt: true, id: true, labels: true, name: true, namespaceId: true, updatedAt: true, value: true } }).execute();

// Get one by id
const item = await db.platformConfig.findOne({ id: '<UUID>', select: { annotations: true, createdAt: true, description: true, expiresAt: true, id: true, labels: true, name: true, namespaceId: true, updatedAt: true, value: true } }).execute();

// Create
const created = await db.platformConfig.create({ data: { annotations: '<JSON>', description: '<String>', expiresAt: '<Datetime>', labels: '<JSON>', name: '<String>', namespaceId: '<UUID>', value: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformConfig.update({ where: { id: '<UUID>' }, data: { annotations: '<JSON>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformConfig.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformBucket`

CRUD operations for PlatformBucket records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `actorId` | UUID | Yes |
| `allowCustomKeys` | Boolean | Yes |
| `allowedMimeTypes` | String | Yes |
| `allowedOrigins` | String | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `id` | UUID | No |
| `isPublic` | Boolean | Yes |
| `key` | String | Yes |
| `maxFileSize` | BigInt | Yes |
| `type` | String | Yes |
| `updatedAt` | Datetime | No |

**Operations:**

```typescript
// List all platformBucket records
const items = await db.platformBucket.findMany({ select: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, databaseId: true, description: true, id: true, isPublic: true, key: true, maxFileSize: true, type: true, updatedAt: true } }).execute();

// Get one by id
const item = await db.platformBucket.findOne({ id: '<UUID>', select: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, databaseId: true, description: true, id: true, isPublic: true, key: true, maxFileSize: true, type: true, updatedAt: true } }).execute();

// Create
const created = await db.platformBucket.create({ data: { actorId: '<UUID>', allowCustomKeys: '<Boolean>', allowedMimeTypes: '<String>', allowedOrigins: '<String>', databaseId: '<UUID>', description: '<String>', isPublic: '<Boolean>', key: '<String>', maxFileSize: '<BigInt>', type: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformBucket.update({ where: { id: '<UUID>' }, data: { actorId: '<UUID>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformBucket.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.platformFile`

CRUD operations for PlatformFile records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `filePath` | String | Yes |
| `actorId` | UUID | Yes |
| `bucketId` | UUID | Yes |
| `contentHash` | String | Yes |
| `createdAt` | Datetime | No |
| `databaseId` | UUID | Yes |
| `description` | String | Yes |
| `filename` | String | Yes |
| `id` | UUID | No |
| `isPublic` | Boolean | Yes |
| `key` | String | Yes |
| `mimeType` | String | Yes |
| `size` | BigInt | Yes |
| `tags` | String | Yes |
| `updatedAt` | Datetime | No |
| `upload` | ConstructiveInternalTypeUpload | Yes |
| `status` | FileStatus | Yes |
| `downloadUrl` | String | Yes |

**Operations:**

```typescript
// List all platformFile records
const items = await db.platformFile.findMany({ select: { filePath: true, actorId: true, bucketId: true, contentHash: true, createdAt: true, databaseId: true, description: true, filename: true, id: true, isPublic: true, key: true, mimeType: true, size: true, tags: true, updatedAt: true, upload: true, status: true, downloadUrl: true } }).execute();

// Get one by id
const item = await db.platformFile.findOne({ id: '<UUID>', select: { filePath: true, actorId: true, bucketId: true, contentHash: true, createdAt: true, databaseId: true, description: true, filename: true, id: true, isPublic: true, key: true, mimeType: true, size: true, tags: true, updatedAt: true, upload: true, status: true, downloadUrl: true } }).execute();

// Create
const created = await db.platformFile.create({ data: { filePath: '<String>', actorId: '<UUID>', bucketId: '<UUID>', contentHash: '<String>', databaseId: '<UUID>', description: '<String>', filename: '<String>', isPublic: '<Boolean>', key: '<String>', mimeType: '<String>', size: '<BigInt>', tags: '<String>', upload: '<Upload>', status: '<FileStatus>', downloadUrl: '<String>' }, select: { id: true } }).execute();

// Update
const updated = await db.platformFile.update({ where: { id: '<UUID>' }, data: { filePath: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.platformFile.delete({ where: { id: '<UUID>' } }).execute();
```

### `db.user`

CRUD operations for User records.

**Fields:**

| Field | Type | Editable |
|-------|------|----------|
| `createdAt` | Datetime | No |
| `displayName` | String | Yes |
| `id` | UUID | No |
| `profilePicture` | ConstructiveInternalTypeImage | Yes |
| `searchTsv` | FullText | Yes |
| `type` | Int | Yes |
| `updatedAt` | Datetime | No |
| `username` | String | Yes |
| `searchTsvRank` | Float | Yes |
| `displayNameTrgmSimilarity` | Float | Yes |
| `searchScore` | Float | Yes |

**Operations:**

```typescript
// List all user records
const items = await db.user.findMany({ select: { createdAt: true, displayName: true, id: true, profilePicture: true, searchTsv: true, type: true, updatedAt: true, username: true, searchTsvRank: true, displayNameTrgmSimilarity: true, searchScore: true } }).execute();

// Get one by id
const item = await db.user.findOne({ id: '<UUID>', select: { createdAt: true, displayName: true, id: true, profilePicture: true, searchTsv: true, type: true, updatedAt: true, username: true, searchTsvRank: true, displayNameTrgmSimilarity: true, searchScore: true } }).execute();

// Create
const created = await db.user.create({ data: { displayName: '<String>', profilePicture: '<Image>', searchTsv: '<FullText>', type: '<Int>', username: '<String>', searchTsvRank: '<Float>', displayNameTrgmSimilarity: '<Float>', searchScore: '<Float>' }, select: { id: true } }).execute();

// Update
const updated = await db.user.update({ where: { id: '<UUID>' }, data: { displayName: '<String>' }, select: { id: true } }).execute();

// Delete
const deleted = await db.user.delete({ where: { id: '<UUID>' } }).execute();
```

> **Unified Search API fields:** `searchTsv`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

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

## Custom Operations

### `db.mutation.platformSecretsDel`

platformSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformSecretsDelInput (required) |

```typescript
const result = await db.mutation.platformSecretsDel({ input: { secretName: '<String>', secretNamespace: '<String>' } }).execute();
```

### `db.mutation.platformSecretsSet`

platformSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformSecretsSetInput (required) |

```typescript
const result = await db.mutation.platformSecretsSet({ input: { secretName: '<String>', secretValue: '<String>', algo: '<String>', secretNamespace: '<String>' } }).execute();
```

### `db.mutation.orgSecretsDel`

orgSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | OrgSecretsDelInput (required) |

```typescript
const result = await db.mutation.orgSecretsDel({ input: { ownerId: '<UUID>', secretName: '<String>', secretNamespace: '<String>' } }).execute();
```

### `db.mutation.orgSecretsSet`

orgSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | OrgSecretsSetInput (required) |

```typescript
const result = await db.mutation.orgSecretsSet({ input: { ownerId: '<UUID>', secretName: '<String>', secretValue: '<String>', algo: '<String>', secretNamespace: '<String>' } }).execute();
```

### `db.mutation.orgSecretsRemoveArray`

orgSecretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | OrgSecretsRemoveArrayInput (required) |

```typescript
const result = await db.mutation.orgSecretsRemoveArray({ input: { ownerId: '<UUID>', secretNames: '<String>', secretNamespace: '<String>' } }).execute();
```

### `db.mutation.platformFilesRename`

platformFilesRename

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformFilesRenameInput (required) |

```typescript
const result = await db.mutation.platformFilesRename({ input: { pFileId: '<UUID>', pNewFilename: '<String>' } }).execute();
```

### `db.mutation.uploadPlatformFile`

Upload a file: resolves the bucket by key, creates the file row, and returns a presigned PUT URL.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | UploadPlatformFileInput (required) |

```typescript
const result = await db.mutation.uploadPlatformFile({ input: '<UploadPlatformFileInput>' }).execute();
```

### `db.mutation.uploadPlatformFiles`

Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | UploadPlatformFileBulkInput (required) |

```typescript
const result = await db.mutation.uploadPlatformFiles({ input: { bucketKey: '<String>', files: '<UploadPlatformFileBulkFileInput>' } }).execute();
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
