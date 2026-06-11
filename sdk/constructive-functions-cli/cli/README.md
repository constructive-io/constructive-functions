# constructive-functions CLI

<p align="center" width="100%">
  <img height="120" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

## Setup

### Create a context

A context stores per-target endpoint overrides for an environment (dev, staging, production).
Default endpoints are baked in from the codegen config, so local development works with zero configuration.

```bash
# Interactive - prompts for each target endpoint (defaults shown)
constructive-functions context create local

# Non-interactive
constructive-functions context create production \
  --api-endpoint https://api.prod.example.com/graphql \
  --compute-endpoint https://compute.prod.example.com/graphql \
  --objects-endpoint https://objects.prod.example.com/graphql
```

### Activate a context

```bash
constructive-functions context use production
```

### Authenticate

```bash
constructive-functions auth set-token <your-token>
```

## API Targets

| Target | Default Endpoint | Tables | Custom Operations |
|--------|-----------------|--------|-------------------|
| `api` |  | 8 | 9 |
| `compute` |  | 12 | 16 |
| `objects` |  | 5 | 4 |

## Commands

### Infrastructure

| Command | Description |
|---------|-------------|
| `context` | Manage API contexts (per-target endpoints) |
| `auth` | Manage authentication tokens |
| `config` | Manage config key-value store (per-context) |

### api

| Command | Description |
|---------|-------------|
| `api:role-type` | roleType CRUD operations |
| `api:platform-config-definition` | platformConfigDefinition CRUD operations |
| `api:platform-namespace` | platformNamespace CRUD operations |
| `api:platform-config` | platformConfig CRUD operations |
| `api:platform-bucket` | platformBucket CRUD operations |
| `api:platform-file` | platformFile CRUD operations |
| `api:user` | user CRUD operations |
| `api:platform-namespace-event` | platformNamespaceEvent CRUD operations |
| `api:platform-secrets-del` | platformSecretsDel |
| `api:platform-secrets-set` | platformSecretsSet |
| `api:org-secrets-del` | orgSecretsDel |
| `api:org-secrets-set` | orgSecretsSet |
| `api:org-secrets-remove-array` | orgSecretsRemoveArray |
| `api:platform-files-rename` | platformFilesRename |
| `api:upload-platform-file` | Upload a file: resolves the bucket by key, creates the file row, and returns a presigned PUT URL. |
| `api:upload-platform-files` | Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each. |
| `api:provision-bucket` | Provision an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then creates and configures
the S3 bucket with the appropriate privacy policies, CORS rules,
and lifecycle settings. |

### compute

| Command | Description |
|---------|-------------|
| `compute:get-all-record` | getAllRecord CRUD operations |
| `compute:platform-function-graph-ref` | platformFunctionGraphRef CRUD operations |
| `compute:platform-function-graph-store` | platformFunctionGraphStore CRUD operations |
| `compute:platform-function-graph-object` | platformFunctionGraphObject CRUD operations |
| `compute:org-function-execution-log` | orgFunctionExecutionLog CRUD operations |
| `compute:platform-function-graph-commit` | platformFunctionGraphCommit CRUD operations |
| `compute:platform-secret-definition` | platformSecretDefinition CRUD operations |
| `compute:platform-function-execution-log` | platformFunctionExecutionLog CRUD operations |
| `compute:platform-function-graph` | platformFunctionGraph CRUD operations |
| `compute:org-function-invocation` | orgFunctionInvocation CRUD operations |
| `compute:platform-function-invocation` | platformFunctionInvocation CRUD operations |
| `compute:platform-function-definition` | platformFunctionDefinition CRUD operations |
| `compute:platform-read-function-graph` | platformReadFunctionGraph |
| `compute:platform-validate-function-graph` | platformValidateFunctionGraph |
| `compute:init-empty-repo` | initEmptyRepo |
| `compute:platform-import-definitions` | platformImportDefinitions |
| `compute:set-data-at-path` | setDataAtPath |
| `compute:platform-copy-graph` | platformCopyGraph |
| `compute:platform-save-graph` | platformSaveGraph |
| `compute:platform-add-edge-and-save` | platformAddEdgeAndSave |
| `compute:platform-add-node-and-save` | platformAddNodeAndSave |
| `compute:platform-create-function-graph` | platformCreateFunctionGraph |
| `compute:platform-add-edge` | platformAddEdge |
| `compute:platform-add-node` | platformAddNode |
| `compute:platform-import-graph-json` | platformImportGraphJson |
| `compute:insert-node-at-path` | insertNodeAtPath |
| `compute:platform-start-execution` | platformStartExecution |
| `compute:provision-bucket` | Provision an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then creates and configures
the S3 bucket with the appropriate privacy policies, CORS rules,
and lifecycle settings. |

### objects

| Command | Description |
|---------|-------------|
| `objects:get-all-record` | getAllRecord CRUD operations |
| `objects:store` | store CRUD operations |
| `objects:ref` | ref CRUD operations |
| `objects:object` | object CRUD operations |
| `objects:commit` | commit CRUD operations |
| `objects:init-empty-repo` | initEmptyRepo |
| `objects:set-data-at-path` | setDataAtPath |
| `objects:insert-node-at-path` | insertNodeAtPath |
| `objects:provision-bucket` | Provision an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then creates and configures
the S3 bucket with the appropriate privacy policies, CORS rules,
and lifecycle settings. |

## Infrastructure Commands

### `context`

Manage named API contexts (kubectl-style). Each context stores per-target endpoint overrides.

| Subcommand | Description |
|------------|-------------|
| `create <name>` | Create a new context (prompts for per-target endpoints) |
| `list` | List all contexts |
| `use <name>` | Set the active context |
| `current` | Show current context |
| `delete <name>` | Delete a context |

Create options:

- `--api-endpoint <url>` (default: )
- `--compute-endpoint <url>` (default: )
- `--objects-endpoint <url>` (default: )

Configuration is stored at `~/.constructive-functions/config/`.

### `auth`

Manage authentication tokens per context. One shared token is used across all targets.

| Subcommand | Description |
|------------|-------------|
| `set-token <token>` | Store bearer token for current context |
| `status` | Show auth status across all contexts |
| `logout` | Remove credentials for current context |

### `config`

Manage per-context key-value configuration variables.

| Subcommand | Description |
|------------|-------------|
| `get <key>` | Get a config value |
| `set <key> <value>` | Set a config value |
| `list` | List all config values |
| `delete <key>` | Delete a config value |

Variables are scoped to the active context and stored at `~/.constructive-functions/config/`.

## SDK Helpers

The generated `helpers.ts` provides typed client factories for use in scripts and services:

```typescript
import { createApiClient } from './helpers';
import { createComputeClient } from './helpers';
import { createObjectsClient } from './helpers';

const api = createApiClient();
const compute = createComputeClient();
const objects = createObjectsClient();
```

Credential resolution order:
1. appstash store (`~/.constructive-functions/config/`)
2. Environment variables (`CONSTRUCTIVE_FUNCTIONS_TOKEN`, `CONSTRUCTIVE_FUNCTIONS_<TARGET>_ENDPOINT`)
3. Throws with actionable error message

## api Commands

### `api:role-type`

CRUD operations for RoleType records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all roleType records |
| `find-first` | Find first matching roleType record |
| `get` | Get a roleType by id |
| `create` | Create a new roleType |
| `update` | Update an existing roleType |
| `delete` | Delete a roleType |

**Fields:**

| Field | Type |
|-------|------|
| `id` | Int |
| `name` | String |

**Required create fields:** `name`

### `api:platform-config-definition`

CRUD operations for PlatformConfigDefinition records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformConfigDefinition records |
| `find-first` | Find first matching platformConfigDefinition record |
| `get` | Get a platformConfigDefinition by id |
| `create` | Create a new platformConfigDefinition |
| `update` | Update an existing platformConfigDefinition |
| `delete` | Delete a platformConfigDefinition |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `createdAt` | Datetime |
| `defaultValue` | String |
| `description` | String |
| `id` | UUID |
| `isBuiltIn` | Boolean |
| `labels` | JSON |
| `name` | String |
| `updatedAt` | Datetime |

**Required create fields:** `name`
**Optional create fields (backend defaults):** `annotations`, `defaultValue`, `description`, `isBuiltIn`, `labels`

### `api:platform-namespace`

CRUD operations for PlatformNamespace records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformNamespace records |
| `find-first` | Find first matching platformNamespace record |
| `get` | Get a platformNamespace by id |
| `create` | Create a new platformNamespace |
| `update` | Update an existing platformNamespace |
| `delete` | Delete a platformNamespace |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `description` | String |
| `id` | UUID |
| `isActive` | Boolean |
| `labels` | JSON |
| `name` | String |
| `namespaceName` | String |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `name`, `namespaceName`
**Optional create fields (backend defaults):** `annotations`, `description`, `isActive`, `labels`

### `api:platform-config`

CRUD operations for PlatformConfig records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformConfig records |
| `find-first` | Find first matching platformConfig record |
| `get` | Get a platformConfig by id |
| `create` | Create a new platformConfig |
| `update` | Update an existing platformConfig |
| `delete` | Delete a platformConfig |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `createdAt` | Datetime |
| `description` | String |
| `expiresAt` | Datetime |
| `id` | UUID |
| `labels` | JSON |
| `name` | String |
| `namespaceId` | UUID |
| `updatedAt` | Datetime |
| `value` | String |

**Required create fields:** `name`, `namespaceId`
**Optional create fields (backend defaults):** `annotations`, `description`, `expiresAt`, `labels`, `value`

### `api:platform-bucket`

CRUD operations for PlatformBucket records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformBucket records |
| `find-first` | Find first matching platformBucket record |
| `get` | Get a platformBucket by id |
| `create` | Create a new platformBucket |
| `update` | Update an existing platformBucket |
| `delete` | Delete a platformBucket |

**Fields:**

| Field | Type |
|-------|------|
| `actorId` | UUID |
| `allowCustomKeys` | Boolean |
| `allowedMimeTypes` | String |
| `allowedOrigins` | String |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `description` | String |
| `id` | UUID |
| `isPublic` | Boolean |
| `key` | String |
| `maxFileSize` | BigInt |
| `type` | String |
| `updatedAt` | Datetime |

**Required create fields:** `actorId`, `databaseId`, `key`
**Optional create fields (backend defaults):** `allowCustomKeys`, `allowedMimeTypes`, `allowedOrigins`, `description`, `isPublic`, `maxFileSize`, `type`

### `api:platform-file`

CRUD operations for PlatformFile records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFile records |
| `find-first` | Find first matching platformFile record |
| `get` | Get a platformFile by id |
| `create` | Create a new platformFile |
| `update` | Update an existing platformFile |
| `delete` | Delete a platformFile |

**Fields:**

| Field | Type |
|-------|------|
| `filePath` | String |
| `actorId` | UUID |
| `bucketId` | UUID |
| `contentHash` | String |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `description` | String |
| `filename` | String |
| `id` | UUID |
| `isPublic` | Boolean |
| `key` | String |
| `mimeType` | String |
| `size` | BigInt |
| `tags` | String |
| `updatedAt` | Datetime |
| `upload` | Upload |
| `status` | FileStatus |
| `downloadUrl` | String |

**Required create fields:** `actorId`, `bucketId`, `databaseId`, `key`, `mimeType`, `size`
**Optional create fields (backend defaults):** `contentHash`, `description`, `filename`, `isPublic`, `tags`, `upload`, `status`

### `api:user`

CRUD operations for User records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all user records |
| `find-first` | Find first matching user record |
| `search <query>` | Search user records |
| `get` | Get a user by id |
| `create` | Create a new user |
| `update` | Update an existing user |
| `delete` | Delete a user |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `displayName` | String |
| `id` | UUID |
| `profilePicture` | Image |
| `searchTsv` | FullText |
| `type` | Int |
| `updatedAt` | Datetime |
| `username` | String |
| `searchTsvRank` | Float |
| `displayNameTrgmSimilarity` | Float |
| `searchScore` | Float |

**Optional create fields (backend defaults):** `displayName`, `profilePicture`, `type`, `username`
> **Unified Search API fields:** `searchTsv`, `displayNameTrgmSimilarity`, `searchScore`
> Fields provided by the Unified Search plugin. Includes full-text search (tsvector/BM25), trigram similarity scores, and the combined searchScore. Computed fields are read-only and cannot be set in create/update operations.

**Search Examples:**

*Full-text search via tsvector (`searchTsv`):*
```bash
constructive-functions api:user list --where.searchTsv "search query" --select title,tsvRank
```

*Fuzzy search via trigram similarity (`trgmDisplayName`):*
```bash
constructive-functions api:user list --where.trgmDisplayName.value "approximate query" --where.trgmDisplayName.threshold 0.3 --select title,displayNameTrgmSimilarity
```

*Composite search (unifiedSearch dispatches to all text adapters):*
```bash
constructive-functions api:user list --where.unifiedSearch "search query" --select title,tsvRank,displayNameTrgmSimilarity,searchScore
```

*Search with pagination and field projection:*
```bash
constructive-functions api:user list --where.unifiedSearch "query" --limit 10 --select id,title,searchScore
constructive-functions api:user search "query" --limit 10 --select id,title,searchScore
```


### `api:platform-namespace-event`

CRUD operations for PlatformNamespaceEvent records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformNamespaceEvent records |
| `find-first` | Find first matching platformNamespaceEvent record |
| `get` | Get a platformNamespaceEvent by id |
| `create` | Create a new platformNamespaceEvent |
| `update` | Update an existing platformNamespaceEvent |
| `delete` | Delete a platformNamespaceEvent |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `actorId` | UUID |
| `cpuMillicores` | Int |
| `databaseId` | UUID |
| `eventType` | String |
| `id` | UUID |
| `memoryBytes` | BigInt |
| `message` | String |
| `metadata` | JSON |
| `metrics` | JSON |
| `namespaceId` | UUID |
| `networkEgressBytes` | BigInt |
| `networkIngressBytes` | BigInt |
| `podCount` | Int |
| `storageBytes` | BigInt |

**Required create fields:** `databaseId`, `eventType`, `namespaceId`
**Optional create fields (backend defaults):** `actorId`, `cpuMillicores`, `memoryBytes`, `message`, `metadata`, `metrics`, `networkEgressBytes`, `networkIngressBytes`, `podCount`, `storageBytes`

### `api:platform-secrets-del`

platformSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.secretName` | String |
  | `--input.secretNamespace` | String |

### `api:platform-secrets-set`

platformSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.secretName` | String |
  | `--input.secretValue` | String |
  | `--input.algo` | String |
  | `--input.secretNamespace` | String |

### `api:org-secrets-del`

orgSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.ownerId` | UUID |
  | `--input.secretName` | String |
  | `--input.secretNamespace` | String |

### `api:org-secrets-set`

orgSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.ownerId` | UUID |
  | `--input.secretName` | String |
  | `--input.secretValue` | String |
  | `--input.algo` | String |
  | `--input.secretNamespace` | String |

### `api:org-secrets-remove-array`

orgSecretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.ownerId` | UUID |
  | `--input.secretNames` | String |
  | `--input.secretNamespace` | String |

### `api:platform-files-rename`

platformFilesRename

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.pFileId` | UUID |
  | `--input.pNewFilename` | String |

### `api:upload-platform-file`

Upload a file: resolves the bucket by key, creates the file row, and returns a presigned PUT URL.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.bucketKey` | String (required) |
  | `--input.contentHash` | String (required) |
  | `--input.contentType` | String (required) |
  | `--input.size` | Int (required) |
  | `--input.filename` | String |
  | `--input.key` | String |

### `api:upload-platform-files`

Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.bucketKey` | String (required) |
  | `--input.files` | UploadPlatformFileBulkFileInput (required) |

### `api:provision-bucket`

Provision an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then creates and configures
the S3 bucket with the appropriate privacy policies, CORS rules,
and lifecycle settings.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.bucketKey` | String (required) |
  | `--input.ownerId` | UUID |

## compute Commands

### `compute:get-all-record`

CRUD operations for GetAllRecord records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all getAllRecord records |
| `find-first` | Find first matching getAllRecord record |
| `get` | Get a getAllRecord by id |
| `create` | Create a new getAllRecord |
| `update` | Update an existing getAllRecord |
| `delete` | Delete a getAllRecord |

**Fields:**

| Field | Type |
|-------|------|
| `path` | String |
| `data` | JSON |

**Required create fields:** `path`, `data`

### `compute:platform-function-graph-ref`

CRUD operations for PlatformFunctionGraphRef records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFunctionGraphRef records |
| `find-first` | Find first matching platformFunctionGraphRef record |
| `get` | Get a platformFunctionGraphRef by id |
| `create` | Create a new platformFunctionGraphRef |
| `update` | Update an existing platformFunctionGraphRef |
| `delete` | Delete a platformFunctionGraphRef |

**Fields:**

| Field | Type |
|-------|------|
| `commitId` | UUID |
| `databaseId` | UUID |
| `id` | UUID |
| `name` | String |
| `storeId` | UUID |

**Required create fields:** `databaseId`, `name`, `storeId`
**Optional create fields (backend defaults):** `commitId`

### `compute:platform-function-graph-store`

CRUD operations for PlatformFunctionGraphStore records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFunctionGraphStore records |
| `find-first` | Find first matching platformFunctionGraphStore record |
| `get` | Get a platformFunctionGraphStore by id |
| `create` | Create a new platformFunctionGraphStore |
| `update` | Update an existing platformFunctionGraphStore |
| `delete` | Delete a platformFunctionGraphStore |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `hash` | UUID |
| `id` | UUID |
| `name` | String |

**Required create fields:** `databaseId`, `name`
**Optional create fields (backend defaults):** `hash`

### `compute:platform-function-graph-object`

CRUD operations for PlatformFunctionGraphObject records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFunctionGraphObject records |
| `find-first` | Find first matching platformFunctionGraphObject record |
| `get` | Get a platformFunctionGraphObject by id |
| `create` | Create a new platformFunctionGraphObject |
| `update` | Update an existing platformFunctionGraphObject |
| `delete` | Delete a platformFunctionGraphObject |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `data` | JSON |
| `databaseId` | UUID |
| `id` | UUID |
| `kids` | UUID |
| `ktree` | String |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `data`, `kids`, `ktree`

### `compute:org-function-execution-log`

CRUD operations for OrgFunctionExecutionLog records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all orgFunctionExecutionLog records |
| `find-first` | Find first matching orgFunctionExecutionLog record |
| `get` | Get a orgFunctionExecutionLog by id |
| `create` | Create a new orgFunctionExecutionLog |
| `update` | Update an existing orgFunctionExecutionLog |
| `delete` | Delete a orgFunctionExecutionLog |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `actorId` | UUID |
| `id` | UUID |
| `invocationId` | UUID |
| `logLevel` | String |
| `message` | String |
| `metadata` | JSON |
| `taskIdentifier` | String |

**Required create fields:** `message`
**Optional create fields (backend defaults):** `actorId`, `invocationId`, `logLevel`, `metadata`, `taskIdentifier`

### `compute:platform-function-graph-commit`

CRUD operations for PlatformFunctionGraphCommit records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFunctionGraphCommit records |
| `find-first` | Find first matching platformFunctionGraphCommit record |
| `get` | Get a platformFunctionGraphCommit by id |
| `create` | Create a new platformFunctionGraphCommit |
| `update` | Update an existing platformFunctionGraphCommit |
| `delete` | Delete a platformFunctionGraphCommit |

**Fields:**

| Field | Type |
|-------|------|
| `authorId` | UUID |
| `committerId` | UUID |
| `databaseId` | UUID |
| `date` | Datetime |
| `id` | UUID |
| `message` | String |
| `parentIds` | UUID |
| `storeId` | UUID |
| `treeId` | UUID |

**Required create fields:** `databaseId`, `storeId`
**Optional create fields (backend defaults):** `authorId`, `committerId`, `date`, `message`, `parentIds`, `treeId`

### `compute:platform-secret-definition`

CRUD operations for PlatformSecretDefinition records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformSecretDefinition records |
| `find-first` | Find first matching platformSecretDefinition record |
| `get` | Get a platformSecretDefinition by id |
| `create` | Create a new platformSecretDefinition |
| `update` | Update an existing platformSecretDefinition |
| `delete` | Delete a platformSecretDefinition |

**Fields:**

| Field | Type |
|-------|------|
| `annotations` | JSON |
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `description` | String |
| `id` | UUID |
| `isBuiltIn` | Boolean |
| `labels` | JSON |
| `name` | String |
| `updatedAt` | Datetime |

**Required create fields:** `databaseId`, `name`
**Optional create fields (backend defaults):** `annotations`, `description`, `isBuiltIn`, `labels`

### `compute:platform-function-execution-log`

CRUD operations for PlatformFunctionExecutionLog records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFunctionExecutionLog records |
| `find-first` | Find first matching platformFunctionExecutionLog record |
| `get` | Get a platformFunctionExecutionLog by id |
| `create` | Create a new platformFunctionExecutionLog |
| `update` | Update an existing platformFunctionExecutionLog |
| `delete` | Delete a platformFunctionExecutionLog |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `actorId` | UUID |
| `databaseId` | UUID |
| `id` | UUID |
| `invocationId` | UUID |
| `logLevel` | String |
| `message` | String |
| `metadata` | JSON |
| `taskIdentifier` | String |

**Required create fields:** `databaseId`, `message`
**Optional create fields (backend defaults):** `actorId`, `invocationId`, `logLevel`, `metadata`, `taskIdentifier`

### `compute:platform-function-graph`

CRUD operations for PlatformFunctionGraph records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFunctionGraph records |
| `find-first` | Find first matching platformFunctionGraph record |
| `get` | Get a platformFunctionGraph by id |
| `create` | Create a new platformFunctionGraph |
| `update` | Update an existing platformFunctionGraph |
| `delete` | Delete a platformFunctionGraph |

**Fields:**

| Field | Type |
|-------|------|
| `context` | String |
| `createdAt` | Datetime |
| `createdBy` | UUID |
| `databaseId` | UUID |
| `definitionsCommitId` | UUID |
| `description` | String |
| `entityId` | UUID |
| `id` | UUID |
| `isValid` | Boolean |
| `name` | String |
| `storeId` | UUID |
| `updatedAt` | Datetime |
| `validationErrors` | JSON |

**Required create fields:** `databaseId`, `name`, `storeId`
**Optional create fields (backend defaults):** `context`, `createdBy`, `definitionsCommitId`, `description`, `entityId`, `isValid`, `validationErrors`

### `compute:org-function-invocation`

CRUD operations for OrgFunctionInvocation records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all orgFunctionInvocation records |
| `find-first` | Find first matching orgFunctionInvocation record |
| `get` | Get a orgFunctionInvocation by id |
| `create` | Create a new orgFunctionInvocation |
| `update` | Update an existing orgFunctionInvocation |
| `delete` | Delete a orgFunctionInvocation |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `actorId` | UUID |
| `completedAt` | Datetime |
| `durationMs` | Int |
| `error` | String |
| `graphExecutionId` | UUID |
| `id` | UUID |
| `jobId` | BigInt |
| `parentInvocationId` | UUID |
| `payload` | JSON |
| `result` | JSON |
| `startedAt` | Datetime |
| `status` | String |
| `taskIdentifier` | String |

**Required create fields:** `taskIdentifier`
**Optional create fields (backend defaults):** `actorId`, `completedAt`, `durationMs`, `error`, `graphExecutionId`, `jobId`, `parentInvocationId`, `payload`, `result`, `startedAt`, `status`

### `compute:platform-function-invocation`

CRUD operations for PlatformFunctionInvocation records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFunctionInvocation records |
| `find-first` | Find first matching platformFunctionInvocation record |
| `get` | Get a platformFunctionInvocation by id |
| `create` | Create a new platformFunctionInvocation |
| `update` | Update an existing platformFunctionInvocation |
| `delete` | Delete a platformFunctionInvocation |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `actorId` | UUID |
| `completedAt` | Datetime |
| `databaseId` | UUID |
| `durationMs` | Int |
| `error` | String |
| `graphExecutionId` | UUID |
| `id` | UUID |
| `jobId` | BigInt |
| `parentInvocationId` | UUID |
| `payload` | JSON |
| `result` | JSON |
| `startedAt` | Datetime |
| `status` | String |
| `taskIdentifier` | String |

**Required create fields:** `databaseId`, `taskIdentifier`
**Optional create fields (backend defaults):** `actorId`, `completedAt`, `durationMs`, `error`, `graphExecutionId`, `jobId`, `parentInvocationId`, `payload`, `result`, `startedAt`, `status`

### `compute:platform-function-definition`

CRUD operations for PlatformFunctionDefinition records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all platformFunctionDefinition records |
| `find-first` | Find first matching platformFunctionDefinition record |
| `get` | Get a platformFunctionDefinition by id |
| `create` | Create a new platformFunctionDefinition |
| `update` | Update an existing platformFunctionDefinition |
| `delete` | Delete a platformFunctionDefinition |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `description` | String |
| `id` | UUID |
| `isBuiltIn` | Boolean |
| `isInvocable` | Boolean |
| `maxAttempts` | Int |
| `name` | String |
| `namespaceId` | UUID |
| `priority` | Int |
| `queueName` | String |
| `scope` | String |
| `serviceUrl` | String |
| `taskIdentifier` | String |
| `updatedAt` | Datetime |
| `requiredConfigs` | FunctionRequirement |
| `requiredSecrets` | FunctionRequirement |

**Required create fields:** `name`, `scope`, `taskIdentifier`
**Optional create fields (backend defaults):** `description`, `isBuiltIn`, `isInvocable`, `maxAttempts`, `namespaceId`, `priority`, `queueName`, `serviceUrl`, `requiredConfigs`, `requiredSecrets`

### `compute:platform-read-function-graph`

platformReadFunctionGraph

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--graphId` | UUID |

### `compute:platform-validate-function-graph`

platformValidateFunctionGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.graphId` | UUID |

### `compute:init-empty-repo`

initEmptyRepo

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.sId` | UUID |
  | `--input.storeId` | UUID |

### `compute:platform-import-definitions`

platformImportDefinitions

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.graphId` | UUID |
  | `--input.sourceScopeId` | UUID |
  | `--input.sourceCommitId` | UUID |
  | `--input.contexts` | String |

### `compute:set-data-at-path`

setDataAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.sId` | UUID |
  | `--input.root` | UUID |
  | `--input.path` | String |
  | `--input.data` | JSON |

### `compute:platform-copy-graph`

platformCopyGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.databaseId` | UUID |
  | `--input.graphId` | UUID |
  | `--input.name` | String |

### `compute:platform-save-graph`

platformSaveGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.graphId` | UUID |
  | `--input.rootHash` | UUID |
  | `--input.message` | String |

### `compute:platform-add-edge-and-save`

platformAddEdgeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.graphId` | UUID |
  | `--input.srcNode` | String |
  | `--input.srcPort` | String |
  | `--input.dstNode` | String |
  | `--input.dstPort` | String |
  | `--input.message` | String |

### `compute:platform-add-node-and-save`

platformAddNodeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.graphId` | UUID |
  | `--input.nodeName` | String |
  | `--input.nodeType` | String |
  | `--input.props` | JSON |
  | `--input.meta` | JSON |
  | `--input.message` | String |

### `compute:platform-create-function-graph`

platformCreateFunctionGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.databaseId` | UUID |
  | `--input.name` | String |
  | `--input.context` | String |
  | `--input.description` | String |
  | `--input.entityId` | UUID |
  | `--input.createdBy` | UUID |
  | `--input.definitionsCommitId` | UUID |

### `compute:platform-add-edge`

platformAddEdge

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.databaseId` | UUID |
  | `--input.rootHash` | UUID |
  | `--input.srcNode` | String |
  | `--input.srcPort` | String |
  | `--input.dstNode` | String |
  | `--input.dstPort` | String |
  | `--input.context` | String |
  | `--input.graphName` | String |

### `compute:platform-add-node`

platformAddNode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.databaseId` | UUID |
  | `--input.rootHash` | UUID |
  | `--input.nodeName` | String |
  | `--input.nodeType` | String |
  | `--input.context` | String |
  | `--input.graphName` | String |
  | `--input.props` | JSON |
  | `--input.meta` | JSON |

### `compute:platform-import-graph-json`

platformImportGraphJson

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.databaseId` | UUID |
  | `--input.name` | String |
  | `--input.graphJson` | JSON |
  | `--input.context` | String |
  | `--input.description` | String |
  | `--input.entityId` | UUID |
  | `--input.createdBy` | UUID |
  | `--input.definitionsCommitId` | UUID |

### `compute:insert-node-at-path`

insertNodeAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.sId` | UUID |
  | `--input.root` | UUID |
  | `--input.path` | String |
  | `--input.data` | JSON |
  | `--input.kids` | UUID |
  | `--input.ktree` | String |

### `compute:platform-start-execution`

platformStartExecution

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.graphId` | UUID |
  | `--input.inputPayload` | JSON |
  | `--input.outputNode` | String |
  | `--input.outputPort` | String |
  | `--input.maxTicks` | Int |
  | `--input.maxPendingJobs` | Int |
  | `--input.timeoutInterval` | IntervalInput |
  | `--input.parentExecutionId` | UUID |
  | `--input.parentNodeName` | String |

### `compute:provision-bucket`

Provision an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then creates and configures
the S3 bucket with the appropriate privacy policies, CORS rules,
and lifecycle settings.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.bucketKey` | String (required) |
  | `--input.ownerId` | UUID |

## objects Commands

### `objects:get-all-record`

CRUD operations for GetAllRecord records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all getAllRecord records |
| `find-first` | Find first matching getAllRecord record |
| `get` | Get a getAllRecord by id |
| `create` | Create a new getAllRecord |
| `update` | Update an existing getAllRecord |
| `delete` | Delete a getAllRecord |

**Fields:**

| Field | Type |
|-------|------|
| `path` | String |
| `data` | JSON |

**Required create fields:** `path`, `data`

### `objects:store`

CRUD operations for Store records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all store records |
| `find-first` | Find first matching store record |
| `get` | Get a store by id |
| `create` | Create a new store |
| `update` | Update an existing store |
| `delete` | Delete a store |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `databaseId` | UUID |
| `hash` | UUID |
| `id` | UUID |
| `name` | String |

**Required create fields:** `databaseId`, `name`
**Optional create fields (backend defaults):** `hash`

### `objects:ref`

CRUD operations for Ref records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all ref records |
| `find-first` | Find first matching ref record |
| `get` | Get a ref by id |
| `create` | Create a new ref |
| `update` | Update an existing ref |
| `delete` | Delete a ref |

**Fields:**

| Field | Type |
|-------|------|
| `commitId` | UUID |
| `databaseId` | UUID |
| `id` | UUID |
| `name` | String |
| `storeId` | UUID |

**Required create fields:** `databaseId`, `name`, `storeId`
**Optional create fields (backend defaults):** `commitId`

### `objects:object`

CRUD operations for Object records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all object records |
| `find-first` | Find first matching object record |
| `get` | Get a object by id |
| `create` | Create a new object |
| `update` | Update an existing object |
| `delete` | Delete a object |

**Fields:**

| Field | Type |
|-------|------|
| `createdAt` | Datetime |
| `data` | JSON |
| `databaseId` | UUID |
| `id` | UUID |
| `kids` | UUID |
| `ktree` | String |

**Required create fields:** `databaseId`
**Optional create fields (backend defaults):** `data`, `kids`, `ktree`

### `objects:commit`

CRUD operations for Commit records.

| Subcommand | Description |
|------------|-------------|
| `list` | List all commit records |
| `find-first` | Find first matching commit record |
| `get` | Get a commit by id |
| `create` | Create a new commit |
| `update` | Update an existing commit |
| `delete` | Delete a commit |

**Fields:**

| Field | Type |
|-------|------|
| `authorId` | UUID |
| `committerId` | UUID |
| `databaseId` | UUID |
| `date` | Datetime |
| `id` | UUID |
| `message` | String |
| `parentIds` | UUID |
| `storeId` | UUID |
| `treeId` | UUID |

**Required create fields:** `databaseId`, `storeId`
**Optional create fields (backend defaults):** `authorId`, `committerId`, `date`, `message`, `parentIds`, `treeId`

### `objects:init-empty-repo`

initEmptyRepo

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.sId` | UUID |
  | `--input.storeId` | UUID |

### `objects:set-data-at-path`

setDataAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.sId` | UUID |
  | `--input.root` | UUID |
  | `--input.path` | String |
  | `--input.data` | JSON |

### `objects:insert-node-at-path`

insertNodeAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.clientMutationId` | String |
  | `--input.sId` | UUID |
  | `--input.root` | UUID |
  | `--input.path` | String |
  | `--input.data` | JSON |
  | `--input.kids` | UUID |
  | `--input.ktree` | String |

### `objects:provision-bucket`

Provision an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then creates and configures
the S3 bucket with the appropriate privacy policies, CORS rules,
and lifecycle settings.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `--input.bucketKey` | String (required) |
  | `--input.ownerId` | UUID |

## Output

All commands output JSON to stdout. Pipe to `jq` for formatting:

```bash
constructive-functions api:role-type list | jq '.[]'
constructive-functions api:role-type get --id <uuid> | jq '.'
```

## Non-Interactive Mode

Use `--no-tty` to skip all interactive prompts (useful for scripts and CI):

```bash
constructive-functions --no-tty api:role-type create --name "Example"
```

---

Built by the [Constructive](https://constructive.io) team.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
