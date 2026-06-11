# React Query Hooks

<p align="center" width="100%">
  <img height="120" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

## Setup

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configure } from './hooks';

configure({
  endpoint: 'https://api.example.com/graphql',
  headers: { Authorization: 'Bearer <token>' },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

## Hooks

| Hook | Type | Description |
|------|------|-------------|
| `useRoleTypesQuery` | Query | List all roleTypes |
| `useRoleTypeQuery` | Query | Get one roleType |
| `useCreateRoleTypeMutation` | Mutation | Create a roleType |
| `useUpdateRoleTypeMutation` | Mutation | Update a roleType |
| `useDeleteRoleTypeMutation` | Mutation | Delete a roleType |
| `usePlatformConfigDefinitionsQuery` | Query | Registry of valid config keys — declares which config entries the platform recognizes |
| `usePlatformConfigDefinitionQuery` | Query | Registry of valid config keys — declares which config entries the platform recognizes |
| `useCreatePlatformConfigDefinitionMutation` | Mutation | Registry of valid config keys — declares which config entries the platform recognizes |
| `useUpdatePlatformConfigDefinitionMutation` | Mutation | Registry of valid config keys — declares which config entries the platform recognizes |
| `useDeletePlatformConfigDefinitionMutation` | Mutation | Registry of valid config keys — declares which config entries the platform recognizes |
| `usePlatformNamespacesQuery` | Query | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `usePlatformNamespaceQuery` | Query | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `useCreatePlatformNamespaceMutation` | Mutation | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `useUpdatePlatformNamespaceMutation` | Mutation | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `useDeletePlatformNamespaceMutation` | Mutation | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `usePlatformConfigsQuery` | Query | App-level plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed |
| `usePlatformConfigQuery` | Query | App-level plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed |
| `useCreatePlatformConfigMutation` | Mutation | App-level plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed |
| `useUpdatePlatformConfigMutation` | Mutation | App-level plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed |
| `useDeletePlatformConfigMutation` | Mutation | App-level plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed |
| `usePlatformBucketsQuery` | Query | Logical storage containers that group files with shared access policies and CDN behavior |
| `usePlatformBucketQuery` | Query | Logical storage containers that group files with shared access policies and CDN behavior |
| `useCreatePlatformBucketMutation` | Mutation | Logical storage containers that group files with shared access policies and CDN behavior |
| `useUpdatePlatformBucketMutation` | Mutation | Logical storage containers that group files with shared access policies and CDN behavior |
| `useDeletePlatformBucketMutation` | Mutation | Logical storage containers that group files with shared access policies and CDN behavior |
| `usePlatformFilesQuery` | Query | Individual file records within buckets, with immutable identity fields and mutable metadata |
| `usePlatformFileQuery` | Query | Individual file records within buckets, with immutable identity fields and mutable metadata |
| `useCreatePlatformFileMutation` | Mutation | Individual file records within buckets, with immutable identity fields and mutable metadata |
| `useUpdatePlatformFileMutation` | Mutation | Individual file records within buckets, with immutable identity fields and mutable metadata |
| `useDeletePlatformFileMutation` | Mutation | Individual file records within buckets, with immutable identity fields and mutable metadata |
| `useUsersQuery` | Query | List all users |
| `useUserQuery` | Query | Get one user |
| `useCreateUserMutation` | Mutation | Create a user |
| `useUpdateUserMutation` | Mutation | Update a user |
| `useDeleteUserMutation` | Mutation | Delete a user |
| `usePlatformNamespaceEventsQuery` | Query | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `usePlatformNamespaceEventQuery` | Query | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `useCreatePlatformNamespaceEventMutation` | Mutation | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `useUpdatePlatformNamespaceEventMutation` | Mutation | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `useDeletePlatformNamespaceEventMutation` | Mutation | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `usePlatformSecretsDelMutation` | Mutation | platformSecretsDel |
| `usePlatformSecretsSetMutation` | Mutation | platformSecretsSet |
| `useOrgSecretsDelMutation` | Mutation | orgSecretsDel |
| `useOrgSecretsSetMutation` | Mutation | orgSecretsSet |
| `useOrgSecretsRemoveArrayMutation` | Mutation | orgSecretsRemoveArray |
| `usePlatformFilesRenameMutation` | Mutation | platformFilesRename |
| `useUploadPlatformFileMutation` | Mutation | Upload a file: resolves the bucket by key, creates the file row, and returns a presigned PUT URL. |
| `useUploadPlatformFilesMutation` | Mutation | Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each. |
| `useProvisionBucketMutation` | Mutation | Provision an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then creates and configures
the S3 bucket with the appropriate privacy policies, CORS rules,
and lifecycle settings. |

## Table Hooks

### RoleType

```typescript
// List all roleTypes
const { data, isLoading } = useRoleTypesQuery({
  selection: { fields: { id: true, name: true } },
});

// Get one roleType
const { data: item } = useRoleTypeQuery({
  id: '<Int>',
  selection: { fields: { id: true, name: true } },
});

// Create a roleType
const { mutate: create } = useCreateRoleTypeMutation({
  selection: { fields: { id: true } },
});
create({ name: '<String>' });
```

### PlatformConfigDefinition

```typescript
// List all platformConfigDefinitions
const { data, isLoading } = usePlatformConfigDefinitionsQuery({
  selection: { fields: { annotations: true, createdAt: true, defaultValue: true, description: true, id: true, isBuiltIn: true, labels: true, name: true, updatedAt: true } },
});

// Get one platformConfigDefinition
const { data: item } = usePlatformConfigDefinitionQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, createdAt: true, defaultValue: true, description: true, id: true, isBuiltIn: true, labels: true, name: true, updatedAt: true } },
});

// Create a platformConfigDefinition
const { mutate: create } = useCreatePlatformConfigDefinitionMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', defaultValue: '<String>', description: '<String>', isBuiltIn: '<Boolean>', labels: '<JSON>', name: '<String>' });
```

### PlatformNamespace

```typescript
// List all platformNamespaces
const { data, isLoading } = usePlatformNamespacesQuery({
  selection: { fields: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, isActive: true, labels: true, name: true, namespaceName: true, updatedAt: true } },
});

// Get one platformNamespace
const { data: item } = usePlatformNamespaceQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, isActive: true, labels: true, name: true, namespaceName: true, updatedAt: true } },
});

// Create a platformNamespace
const { mutate: create } = useCreatePlatformNamespaceMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', databaseId: '<UUID>', description: '<String>', isActive: '<Boolean>', labels: '<JSON>', name: '<String>', namespaceName: '<String>' });
```

### PlatformConfig

```typescript
// List all platformConfigs
const { data, isLoading } = usePlatformConfigsQuery({
  selection: { fields: { annotations: true, createdAt: true, description: true, expiresAt: true, id: true, labels: true, name: true, namespaceId: true, updatedAt: true, value: true } },
});

// Get one platformConfig
const { data: item } = usePlatformConfigQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, createdAt: true, description: true, expiresAt: true, id: true, labels: true, name: true, namespaceId: true, updatedAt: true, value: true } },
});

// Create a platformConfig
const { mutate: create } = useCreatePlatformConfigMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', description: '<String>', expiresAt: '<Datetime>', labels: '<JSON>', name: '<String>', namespaceId: '<UUID>', value: '<String>' });
```

### PlatformBucket

```typescript
// List all platformBuckets
const { data, isLoading } = usePlatformBucketsQuery({
  selection: { fields: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, databaseId: true, description: true, id: true, isPublic: true, key: true, maxFileSize: true, type: true, updatedAt: true } },
});

// Get one platformBucket
const { data: item } = usePlatformBucketQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, allowCustomKeys: true, allowedMimeTypes: true, allowedOrigins: true, createdAt: true, databaseId: true, description: true, id: true, isPublic: true, key: true, maxFileSize: true, type: true, updatedAt: true } },
});

// Create a platformBucket
const { mutate: create } = useCreatePlatformBucketMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', allowCustomKeys: '<Boolean>', allowedMimeTypes: '<String>', allowedOrigins: '<String>', databaseId: '<UUID>', description: '<String>', isPublic: '<Boolean>', key: '<String>', maxFileSize: '<BigInt>', type: '<String>' });
```

### PlatformFile

```typescript
// List all platformFiles
const { data, isLoading } = usePlatformFilesQuery({
  selection: { fields: { filePath: true, actorId: true, bucketId: true, contentHash: true, createdAt: true, databaseId: true, description: true, filename: true, id: true, isPublic: true, key: true, mimeType: true, size: true, tags: true, updatedAt: true, upload: true, status: true, downloadUrl: true } },
});

// Get one platformFile
const { data: item } = usePlatformFileQuery({
  id: '<UUID>',
  selection: { fields: { filePath: true, actorId: true, bucketId: true, contentHash: true, createdAt: true, databaseId: true, description: true, filename: true, id: true, isPublic: true, key: true, mimeType: true, size: true, tags: true, updatedAt: true, upload: true, status: true, downloadUrl: true } },
});

// Create a platformFile
const { mutate: create } = useCreatePlatformFileMutation({
  selection: { fields: { id: true } },
});
create({ filePath: '<String>', actorId: '<UUID>', bucketId: '<UUID>', contentHash: '<String>', databaseId: '<UUID>', description: '<String>', filename: '<String>', isPublic: '<Boolean>', key: '<String>', mimeType: '<String>', size: '<BigInt>', tags: '<String>', upload: '<Upload>', status: '<FileStatus>', downloadUrl: '<String>' });
```

### User

```typescript
// List all users
const { data, isLoading } = useUsersQuery({
  selection: { fields: { createdAt: true, displayName: true, id: true, profilePicture: true, searchTsv: true, type: true, updatedAt: true, username: true, searchTsvRank: true, displayNameTrgmSimilarity: true, searchScore: true } },
});

// Get one user
const { data: item } = useUserQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, displayName: true, id: true, profilePicture: true, searchTsv: true, type: true, updatedAt: true, username: true, searchTsvRank: true, displayNameTrgmSimilarity: true, searchScore: true } },
});

// Create a user
const { mutate: create } = useCreateUserMutation({
  selection: { fields: { id: true } },
});
create({ displayName: '<String>', profilePicture: '<Image>', searchTsv: '<FullText>', type: '<Int>', username: '<String>', searchTsvRank: '<Float>', displayNameTrgmSimilarity: '<Float>', searchScore: '<Float>' });
```

### PlatformNamespaceEvent

```typescript
// List all platformNamespaceEvents
const { data, isLoading } = usePlatformNamespaceEventsQuery({
  selection: { fields: { createdAt: true, actorId: true, cpuMillicores: true, databaseId: true, eventType: true, id: true, memoryBytes: true, message: true, metadata: true, metrics: true, namespaceId: true, networkEgressBytes: true, networkIngressBytes: true, podCount: true, storageBytes: true } },
});

// Get one platformNamespaceEvent
const { data: item } = usePlatformNamespaceEventQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, actorId: true, cpuMillicores: true, databaseId: true, eventType: true, id: true, memoryBytes: true, message: true, metadata: true, metrics: true, namespaceId: true, networkEgressBytes: true, networkIngressBytes: true, podCount: true, storageBytes: true } },
});

// Create a platformNamespaceEvent
const { mutate: create } = useCreatePlatformNamespaceEventMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', cpuMillicores: '<Int>', databaseId: '<UUID>', eventType: '<String>', memoryBytes: '<BigInt>', message: '<String>', metadata: '<JSON>', metrics: '<JSON>', namespaceId: '<UUID>', networkEgressBytes: '<BigInt>', networkIngressBytes: '<BigInt>', podCount: '<Int>', storageBytes: '<BigInt>' });
```

## Custom Operation Hooks

### `usePlatformSecretsDelMutation`

platformSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformSecretsDelInput (required) |

### `usePlatformSecretsSetMutation`

platformSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformSecretsSetInput (required) |

### `useOrgSecretsDelMutation`

orgSecretsDel

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | OrgSecretsDelInput (required) |

### `useOrgSecretsSetMutation`

orgSecretsSet

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | OrgSecretsSetInput (required) |

### `useOrgSecretsRemoveArrayMutation`

orgSecretsRemoveArray

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | OrgSecretsRemoveArrayInput (required) |

### `usePlatformFilesRenameMutation`

platformFilesRename

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformFilesRenameInput (required) |

### `useUploadPlatformFileMutation`

Upload a file: resolves the bucket by key, creates the file row, and returns a presigned PUT URL.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | UploadPlatformFileInput (required) |

### `useUploadPlatformFilesMutation`

Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | UploadPlatformFileBulkInput (required) |

### `useProvisionBucketMutation`

Provision an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then creates and configures
the S3 bucket with the appropriate privacy policies, CORS rules,
and lifecycle settings.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionBucketInput (required) |

---

Built by the [Constructive](https://constructive.io) team.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
