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
| `useGetAllQuery` | Query | List all getAll |
| `useCreateGetAllRecordMutation` | Mutation | Create a getAllRecord |
| `usePlatformFunctionGraphRefsQuery` | Query | Branch heads — mutable pointers into the commit chain |
| `usePlatformFunctionGraphRefQuery` | Query | Branch heads — mutable pointers into the commit chain |
| `useCreatePlatformFunctionGraphRefMutation` | Mutation | Branch heads — mutable pointers into the commit chain |
| `useUpdatePlatformFunctionGraphRefMutation` | Mutation | Branch heads — mutable pointers into the commit chain |
| `useDeletePlatformFunctionGraphRefMutation` | Mutation | Branch heads — mutable pointers into the commit chain |
| `usePlatformFunctionGraphStoresQuery` | Query | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `usePlatformFunctionGraphStoreQuery` | Query | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useCreatePlatformFunctionGraphStoreMutation` | Mutation | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useUpdatePlatformFunctionGraphStoreMutation` | Mutation | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `useDeletePlatformFunctionGraphStoreMutation` | Mutation | Named stores — one per version-controlled tree (e.g. one graph, one definition set) |
| `usePlatformFunctionGraphObjectsQuery` | Query | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `usePlatformFunctionGraphObjectQuery` | Query | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useCreatePlatformFunctionGraphObjectMutation` | Mutation | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useUpdatePlatformFunctionGraphObjectMutation` | Mutation | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useDeletePlatformFunctionGraphObjectMutation` | Mutation | Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children |
| `useOrgFunctionExecutionLogsQuery` | Query | Function execution logs — structured console output per invocation |
| `useOrgFunctionExecutionLogQuery` | Query | Function execution logs — structured console output per invocation |
| `useCreateOrgFunctionExecutionLogMutation` | Mutation | Function execution logs — structured console output per invocation |
| `useUpdateOrgFunctionExecutionLogMutation` | Mutation | Function execution logs — structured console output per invocation |
| `useDeleteOrgFunctionExecutionLogMutation` | Mutation | Function execution logs — structured console output per invocation |
| `usePlatformFunctionGraphCommitsQuery` | Query | Commit history — each commit snapshots a tree root for a store |
| `usePlatformFunctionGraphCommitQuery` | Query | Commit history — each commit snapshots a tree root for a store |
| `useCreatePlatformFunctionGraphCommitMutation` | Mutation | Commit history — each commit snapshots a tree root for a store |
| `useUpdatePlatformFunctionGraphCommitMutation` | Mutation | Commit history — each commit snapshots a tree root for a store |
| `useDeletePlatformFunctionGraphCommitMutation` | Mutation | Commit history — each commit snapshots a tree root for a store |
| `usePlatformSecretDefinitionsQuery` | Query | Global secret name registry — declares which secrets the platform recognizes. Actual values live in app_secrets. |
| `usePlatformSecretDefinitionQuery` | Query | Global secret name registry — declares which secrets the platform recognizes. Actual values live in app_secrets. |
| `useCreatePlatformSecretDefinitionMutation` | Mutation | Global secret name registry — declares which secrets the platform recognizes. Actual values live in app_secrets. |
| `useUpdatePlatformSecretDefinitionMutation` | Mutation | Global secret name registry — declares which secrets the platform recognizes. Actual values live in app_secrets. |
| `useDeletePlatformSecretDefinitionMutation` | Mutation | Global secret name registry — declares which secrets the platform recognizes. Actual values live in app_secrets. |
| `usePlatformFunctionExecutionLogsQuery` | Query | Function execution logs — structured console output per invocation |
| `usePlatformFunctionExecutionLogQuery` | Query | Function execution logs — structured console output per invocation |
| `useCreatePlatformFunctionExecutionLogMutation` | Mutation | Function execution logs — structured console output per invocation |
| `useUpdatePlatformFunctionExecutionLogMutation` | Mutation | Function execution logs — structured console output per invocation |
| `useDeletePlatformFunctionExecutionLogMutation` | Mutation | Function execution logs — structured console output per invocation |
| `usePlatformFunctionGraphsQuery` | Query | Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store |
| `usePlatformFunctionGraphQuery` | Query | Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store |
| `useCreatePlatformFunctionGraphMutation` | Mutation | Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store |
| `useUpdatePlatformFunctionGraphMutation` | Mutation | Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store |
| `useDeletePlatformFunctionGraphMutation` | Mutation | Flow graph definitions — FBP graphs stored in the dedicated graph Merkle store |
| `usePlatformComputeLogsQuery` | Query | List all platformComputeLogs |
| `usePlatformComputeLogQuery` | Query | Get one platformComputeLog |
| `useCreatePlatformComputeLogMutation` | Mutation | Create a platformComputeLog |
| `useUpdatePlatformComputeLogMutation` | Mutation | Update a platformComputeLog |
| `useDeletePlatformComputeLogMutation` | Mutation | Delete a platformComputeLog |
| `usePlatformUsageDailiesQuery` | Query | List all platformUsageDailies |
| `usePlatformUsageDailyQuery` | Query | Get one platformUsageDaily |
| `useCreatePlatformUsageDailyMutation` | Mutation | Create a platformUsageDaily |
| `useUpdatePlatformUsageDailyMutation` | Mutation | Update a platformUsageDaily |
| `useDeletePlatformUsageDailyMutation` | Mutation | Delete a platformUsageDaily |
| `useOrgFunctionInvocationsQuery` | Query | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions by task_identifier string. |
| `useOrgFunctionInvocationQuery` | Query | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions by task_identifier string. |
| `useCreateOrgFunctionInvocationMutation` | Mutation | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions by task_identifier string. |
| `useUpdateOrgFunctionInvocationMutation` | Mutation | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions by task_identifier string. |
| `useDeleteOrgFunctionInvocationMutation` | Mutation | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions by task_identifier string. |
| `usePlatformFunctionInvocationsQuery` | Query | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions by task_identifier string. |
| `usePlatformFunctionInvocationQuery` | Query | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions by task_identifier string. |
| `useCreatePlatformFunctionInvocationMutation` | Mutation | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions by task_identifier string. |
| `useUpdatePlatformFunctionInvocationMutation` | Mutation | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions by task_identifier string. |
| `useDeletePlatformFunctionInvocationMutation` | Mutation | Function invocation log — INSERT to call a function (business-layer, metered). Linked to definitions by task_identifier string. |
| `usePlatformFunctionDefinitionsQuery` | Query | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `usePlatformFunctionDefinitionQuery` | Query | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `useCreatePlatformFunctionDefinitionMutation` | Mutation | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `useUpdatePlatformFunctionDefinitionMutation` | Mutation | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `useDeletePlatformFunctionDefinitionMutation` | Mutation | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `usePlatformReadFunctionGraphQuery` | Query | platformReadFunctionGraph |
| `usePlatformValidateFunctionGraphMutation` | Mutation | platformValidateFunctionGraph |
| `useInitEmptyRepoMutation` | Mutation | initEmptyRepo |
| `usePlatformImportDefinitionsMutation` | Mutation | platformImportDefinitions |
| `useSetDataAtPathMutation` | Mutation | setDataAtPath |
| `usePlatformCopyGraphMutation` | Mutation | platformCopyGraph |
| `usePlatformSaveGraphMutation` | Mutation | platformSaveGraph |
| `usePlatformAddEdgeAndSaveMutation` | Mutation | platformAddEdgeAndSave |
| `usePlatformAddNodeAndSaveMutation` | Mutation | platformAddNodeAndSave |
| `usePlatformCreateFunctionGraphMutation` | Mutation | platformCreateFunctionGraph |
| `usePlatformAddEdgeMutation` | Mutation | platformAddEdge |
| `usePlatformAddNodeMutation` | Mutation | platformAddNode |
| `usePlatformImportGraphJsonMutation` | Mutation | platformImportGraphJson |
| `useInsertNodeAtPathMutation` | Mutation | insertNodeAtPath |
| `usePlatformStartExecutionMutation` | Mutation | platformStartExecution |
| `useProvisionBucketMutation` | Mutation | Provision an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then creates and configures
the S3 bucket with the appropriate privacy policies, CORS rules,
and lifecycle settings. |

## Table Hooks

### GetAllRecord

```typescript
// List all getAll
const { data, isLoading } = useGetAllQuery({
  selection: { fields: { path: true, data: true } },
});

// Create a getAllRecord
const { mutate: create } = useCreateGetAllRecordMutation({
  selection: { fields: { id: true } },
});
create({ path: '<String>', data: '<JSON>' });
```

### PlatformFunctionGraphRef

```typescript
// List all platformFunctionGraphRefs
const { data, isLoading } = usePlatformFunctionGraphRefsQuery({
  selection: { fields: { commitId: true, databaseId: true, id: true, name: true, storeId: true } },
});

// Get one platformFunctionGraphRef
const { data: item } = usePlatformFunctionGraphRefQuery({
  id: '<UUID>',
  selection: { fields: { commitId: true, databaseId: true, id: true, name: true, storeId: true } },
});

// Create a platformFunctionGraphRef
const { mutate: create } = useCreatePlatformFunctionGraphRefMutation({
  selection: { fields: { id: true } },
});
create({ commitId: '<UUID>', databaseId: '<UUID>', name: '<String>', storeId: '<UUID>' });
```

### PlatformFunctionGraphStore

```typescript
// List all platformFunctionGraphStores
const { data, isLoading } = usePlatformFunctionGraphStoresQuery({
  selection: { fields: { createdAt: true, databaseId: true, hash: true, id: true, name: true } },
});

// Get one platformFunctionGraphStore
const { data: item } = usePlatformFunctionGraphStoreQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, databaseId: true, hash: true, id: true, name: true } },
});

// Create a platformFunctionGraphStore
const { mutate: create } = useCreatePlatformFunctionGraphStoreMutation({
  selection: { fields: { id: true } },
});
create({ databaseId: '<UUID>', hash: '<UUID>', name: '<String>' });
```

### PlatformFunctionGraphObject

```typescript
// List all platformFunctionGraphObjects
const { data, isLoading } = usePlatformFunctionGraphObjectsQuery({
  selection: { fields: { createdAt: true, data: true, databaseId: true, id: true, kids: true, ktree: true } },
});

// Get one platformFunctionGraphObject
const { data: item } = usePlatformFunctionGraphObjectQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, data: true, databaseId: true, id: true, kids: true, ktree: true } },
});

// Create a platformFunctionGraphObject
const { mutate: create } = useCreatePlatformFunctionGraphObjectMutation({
  selection: { fields: { id: true } },
});
create({ data: '<JSON>', databaseId: '<UUID>', kids: '<UUID>', ktree: '<String>' });
```

### OrgFunctionExecutionLog

```typescript
// List all orgFunctionExecutionLogs
const { data, isLoading } = useOrgFunctionExecutionLogsQuery({
  selection: { fields: { createdAt: true, actorId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } },
});

// Get one orgFunctionExecutionLog
const { data: item } = useOrgFunctionExecutionLogQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, actorId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } },
});

// Create a orgFunctionExecutionLog
const { mutate: create } = useCreateOrgFunctionExecutionLogMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', invocationId: '<UUID>', logLevel: '<String>', message: '<String>', metadata: '<JSON>', taskIdentifier: '<String>' });
```

### PlatformFunctionGraphCommit

```typescript
// List all platformFunctionGraphCommits
const { data, isLoading } = usePlatformFunctionGraphCommitsQuery({
  selection: { fields: { authorId: true, committerId: true, databaseId: true, date: true, id: true, message: true, parentIds: true, storeId: true, treeId: true } },
});

// Get one platformFunctionGraphCommit
const { data: item } = usePlatformFunctionGraphCommitQuery({
  id: '<UUID>',
  selection: { fields: { authorId: true, committerId: true, databaseId: true, date: true, id: true, message: true, parentIds: true, storeId: true, treeId: true } },
});

// Create a platformFunctionGraphCommit
const { mutate: create } = useCreatePlatformFunctionGraphCommitMutation({
  selection: { fields: { id: true } },
});
create({ authorId: '<UUID>', committerId: '<UUID>', databaseId: '<UUID>', date: '<Datetime>', message: '<String>', parentIds: '<UUID>', storeId: '<UUID>', treeId: '<UUID>' });
```

### PlatformSecretDefinition

```typescript
// List all platformSecretDefinitions
const { data, isLoading } = usePlatformSecretDefinitionsQuery({
  selection: { fields: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, isBuiltIn: true, labels: true, name: true, updatedAt: true } },
});

// Get one platformSecretDefinition
const { data: item } = usePlatformSecretDefinitionQuery({
  id: '<UUID>',
  selection: { fields: { annotations: true, createdAt: true, databaseId: true, description: true, id: true, isBuiltIn: true, labels: true, name: true, updatedAt: true } },
});

// Create a platformSecretDefinition
const { mutate: create } = useCreatePlatformSecretDefinitionMutation({
  selection: { fields: { id: true } },
});
create({ annotations: '<JSON>', databaseId: '<UUID>', description: '<String>', isBuiltIn: '<Boolean>', labels: '<JSON>', name: '<String>' });
```

### PlatformFunctionExecutionLog

```typescript
// List all platformFunctionExecutionLogs
const { data, isLoading } = usePlatformFunctionExecutionLogsQuery({
  selection: { fields: { createdAt: true, actorId: true, databaseId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } },
});

// Get one platformFunctionExecutionLog
const { data: item } = usePlatformFunctionExecutionLogQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, actorId: true, databaseId: true, id: true, invocationId: true, logLevel: true, message: true, metadata: true, taskIdentifier: true } },
});

// Create a platformFunctionExecutionLog
const { mutate: create } = useCreatePlatformFunctionExecutionLogMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', databaseId: '<UUID>', invocationId: '<UUID>', logLevel: '<String>', message: '<String>', metadata: '<JSON>', taskIdentifier: '<String>' });
```

### PlatformFunctionGraph

```typescript
// List all platformFunctionGraphs
const { data, isLoading } = usePlatformFunctionGraphsQuery({
  selection: { fields: { context: true, createdAt: true, createdBy: true, databaseId: true, definitionsCommitId: true, description: true, entityId: true, id: true, isValid: true, name: true, storeId: true, updatedAt: true, validationErrors: true } },
});

// Get one platformFunctionGraph
const { data: item } = usePlatformFunctionGraphQuery({
  id: '<UUID>',
  selection: { fields: { context: true, createdAt: true, createdBy: true, databaseId: true, definitionsCommitId: true, description: true, entityId: true, id: true, isValid: true, name: true, storeId: true, updatedAt: true, validationErrors: true } },
});

// Create a platformFunctionGraph
const { mutate: create } = useCreatePlatformFunctionGraphMutation({
  selection: { fields: { id: true } },
});
create({ context: '<String>', createdBy: '<UUID>', databaseId: '<UUID>', definitionsCommitId: '<UUID>', description: '<String>', entityId: '<UUID>', isValid: '<Boolean>', name: '<String>', storeId: '<UUID>', validationErrors: '<JSON>' });
```

### PlatformComputeLog

```typescript
// List all platformComputeLogs
const { data, isLoading } = usePlatformComputeLogsQuery({
  selection: { fields: { completedAt: true, id: true, databaseId: true, entityId: true, organizationId: true, entityType: true, actorId: true, taskIdentifier: true, jobId: true, invocationId: true, status: true, durationMs: true, error: true } },
});

// Get one platformComputeLog
const { data: item } = usePlatformComputeLogQuery({
  id: '<UUID>',
  selection: { fields: { completedAt: true, id: true, databaseId: true, entityId: true, organizationId: true, entityType: true, actorId: true, taskIdentifier: true, jobId: true, invocationId: true, status: true, durationMs: true, error: true } },
});

// Create a platformComputeLog
const { mutate: create } = useCreatePlatformComputeLogMutation({
  selection: { fields: { id: true } },
});
create({ completedAt: '<Datetime>', databaseId: '<UUID>', entityId: '<UUID>', organizationId: '<UUID>', entityType: '<String>', actorId: '<UUID>', taskIdentifier: '<String>', jobId: '<BigInt>', invocationId: '<UUID>', status: '<String>', durationMs: '<Int>', error: '<String>' });
```

### PlatformUsageDaily

```typescript
// List all platformUsageDailies
const { data, isLoading } = usePlatformUsageDailiesQuery({
  selection: { fields: { id: true, databaseId: true, entityId: true, organizationId: true, entityType: true, taskIdentifier: true, date: true, totalCalls: true, successful: true, failed: true, totalDurationMs: true, minDurationMs: true, maxDurationMs: true } },
});

// Get one platformUsageDaily
const { data: item } = usePlatformUsageDailyQuery({
  id: '<UUID>',
  selection: { fields: { id: true, databaseId: true, entityId: true, organizationId: true, entityType: true, taskIdentifier: true, date: true, totalCalls: true, successful: true, failed: true, totalDurationMs: true, minDurationMs: true, maxDurationMs: true } },
});

// Create a platformUsageDaily
const { mutate: create } = useCreatePlatformUsageDailyMutation({
  selection: { fields: { id: true } },
});
create({ databaseId: '<UUID>', entityId: '<UUID>', organizationId: '<UUID>', entityType: '<String>', taskIdentifier: '<String>', date: '<Date>', totalCalls: '<BigInt>', successful: '<BigInt>', failed: '<BigInt>', totalDurationMs: '<BigInt>', minDurationMs: '<Int>', maxDurationMs: '<Int>' });
```

### OrgFunctionInvocation

```typescript
// List all orgFunctionInvocations
const { data, isLoading } = useOrgFunctionInvocationsQuery({
  selection: { fields: { createdAt: true, actorId: true, completedAt: true, durationMs: true, error: true, graphExecutionId: true, id: true, jobId: true, parentInvocationId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } },
});

// Get one orgFunctionInvocation
const { data: item } = useOrgFunctionInvocationQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, actorId: true, completedAt: true, durationMs: true, error: true, graphExecutionId: true, id: true, jobId: true, parentInvocationId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } },
});

// Create a orgFunctionInvocation
const { mutate: create } = useCreateOrgFunctionInvocationMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', completedAt: '<Datetime>', durationMs: '<Int>', error: '<String>', graphExecutionId: '<UUID>', jobId: '<BigInt>', parentInvocationId: '<UUID>', payload: '<JSON>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' });
```

### PlatformFunctionInvocation

```typescript
// List all platformFunctionInvocations
const { data, isLoading } = usePlatformFunctionInvocationsQuery({
  selection: { fields: { createdAt: true, actorId: true, completedAt: true, databaseId: true, durationMs: true, error: true, graphExecutionId: true, id: true, jobId: true, parentInvocationId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } },
});

// Get one platformFunctionInvocation
const { data: item } = usePlatformFunctionInvocationQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, actorId: true, completedAt: true, databaseId: true, durationMs: true, error: true, graphExecutionId: true, id: true, jobId: true, parentInvocationId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } },
});

// Create a platformFunctionInvocation
const { mutate: create } = useCreatePlatformFunctionInvocationMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', completedAt: '<Datetime>', databaseId: '<UUID>', durationMs: '<Int>', error: '<String>', graphExecutionId: '<UUID>', jobId: '<BigInt>', parentInvocationId: '<UUID>', payload: '<JSON>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' });
```

### PlatformFunctionDefinition

```typescript
// List all platformFunctionDefinitions
const { data, isLoading } = usePlatformFunctionDefinitionsQuery({
  selection: { fields: { createdAt: true, description: true, id: true, isBuiltIn: true, isInvocable: true, maxAttempts: true, name: true, namespaceId: true, priority: true, queueName: true, scope: true, serviceUrl: true, taskIdentifier: true, updatedAt: true, requiredConfigs: true, requiredSecrets: true } },
});

// Get one platformFunctionDefinition
const { data: item } = usePlatformFunctionDefinitionQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, description: true, id: true, isBuiltIn: true, isInvocable: true, maxAttempts: true, name: true, namespaceId: true, priority: true, queueName: true, scope: true, serviceUrl: true, taskIdentifier: true, updatedAt: true, requiredConfigs: true, requiredSecrets: true } },
});

// Create a platformFunctionDefinition
const { mutate: create } = useCreatePlatformFunctionDefinitionMutation({
  selection: { fields: { id: true } },
});
create({ description: '<String>', isBuiltIn: '<Boolean>', isInvocable: '<Boolean>', maxAttempts: '<Int>', name: '<String>', namespaceId: '<UUID>', priority: '<Int>', queueName: '<String>', scope: '<String>', serviceUrl: '<String>', taskIdentifier: '<String>', requiredConfigs: '<FunctionRequirement>', requiredSecrets: '<FunctionRequirement>' });
```

## Custom Operation Hooks

### `usePlatformReadFunctionGraphQuery`

platformReadFunctionGraph

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `graphId` | UUID |

### `usePlatformValidateFunctionGraphMutation`

platformValidateFunctionGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformValidateFunctionGraphInput (required) |

### `useInitEmptyRepoMutation`

initEmptyRepo

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InitEmptyRepoInput (required) |

### `usePlatformImportDefinitionsMutation`

platformImportDefinitions

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformImportDefinitionsInput (required) |

### `useSetDataAtPathMutation`

setDataAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SetDataAtPathInput (required) |

### `usePlatformCopyGraphMutation`

platformCopyGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformCopyGraphInput (required) |

### `usePlatformSaveGraphMutation`

platformSaveGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformSaveGraphInput (required) |

### `usePlatformAddEdgeAndSaveMutation`

platformAddEdgeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformAddEdgeAndSaveInput (required) |

### `usePlatformAddNodeAndSaveMutation`

platformAddNodeAndSave

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformAddNodeAndSaveInput (required) |

### `usePlatformCreateFunctionGraphMutation`

platformCreateFunctionGraph

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformCreateFunctionGraphInput (required) |

### `usePlatformAddEdgeMutation`

platformAddEdge

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformAddEdgeInput (required) |

### `usePlatformAddNodeMutation`

platformAddNode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformAddNodeInput (required) |

### `usePlatformImportGraphJsonMutation`

platformImportGraphJson

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformImportGraphJsonInput (required) |

### `useInsertNodeAtPathMutation`

insertNodeAtPath

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | InsertNodeAtPathInput (required) |

### `usePlatformStartExecutionMutation`

platformStartExecution

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PlatformStartExecutionInput (required) |

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
