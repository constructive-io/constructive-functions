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
| `usePlatformSecretValuesQuery` | Query | Stores configured values for platform secrets (plaintext for now). |
| `usePlatformSecretValueQuery` | Query | Stores configured values for platform secrets (plaintext for now). |
| `useCreatePlatformSecretValueMutation` | Mutation | Stores configured values for platform secrets (plaintext for now). |
| `useUpdatePlatformSecretValueMutation` | Mutation | Stores configured values for platform secrets (plaintext for now). |
| `useDeletePlatformSecretValueMutation` | Mutation | Stores configured values for platform secrets (plaintext for now). |
| `useJobQueuesQuery` | Query | Queue metadata: tracks job counts and locking state for each named queue |
| `useJobQueueQuery` | Query | Queue metadata: tracks job counts and locking state for each named queue |
| `useCreateJobQueueMutation` | Mutation | Queue metadata: tracks job counts and locking state for each named queue |
| `useUpdateJobQueueMutation` | Mutation | Queue metadata: tracks job counts and locking state for each named queue |
| `useDeleteJobQueueMutation` | Mutation | Queue metadata: tracks job counts and locking state for each named queue |
| `usePlatformFunctionExecutionLogsQuery` | Query | Function execution logs — structured console output per invocation |
| `usePlatformFunctionExecutionLogQuery` | Query | Function execution logs — structured console output per invocation |
| `useCreatePlatformFunctionExecutionLogMutation` | Mutation | Function execution logs — structured console output per invocation |
| `useUpdatePlatformFunctionExecutionLogMutation` | Mutation | Function execution logs — structured console output per invocation |
| `useDeletePlatformFunctionExecutionLogMutation` | Mutation | Function execution logs — structured console output per invocation |
| `usePlatformSecretDefinitionsQuery` | Query | Global secret name registry — declares which secrets the platform recognizes. Actual values live in app_secrets. |
| `usePlatformSecretDefinitionQuery` | Query | Global secret name registry — declares which secrets the platform recognizes. Actual values live in app_secrets. |
| `useCreatePlatformSecretDefinitionMutation` | Mutation | Global secret name registry — declares which secrets the platform recognizes. Actual values live in app_secrets. |
| `useUpdatePlatformSecretDefinitionMutation` | Mutation | Global secret name registry — declares which secrets the platform recognizes. Actual values live in app_secrets. |
| `useDeletePlatformSecretDefinitionMutation` | Mutation | Global secret name registry — declares which secrets the platform recognizes. Actual values live in app_secrets. |
| `usePlatformNamespacesQuery` | Query | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `usePlatformNamespaceQuery` | Query | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `useCreatePlatformNamespaceMutation` | Mutation | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `useUpdatePlatformNamespaceMutation` | Mutation | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `useDeletePlatformNamespaceMutation` | Mutation | Logical namespace containers for grouping secrets, config, functions, and other resources |
| `usePlatformFunctionInvocationsQuery` | Query | Function invocation log — INSERT to call a function (business-layer, metered) |
| `usePlatformFunctionInvocationQuery` | Query | Function invocation log — INSERT to call a function (business-layer, metered) |
| `useCreatePlatformFunctionInvocationMutation` | Mutation | Function invocation log — INSERT to call a function (business-layer, metered) |
| `useUpdatePlatformFunctionInvocationMutation` | Mutation | Function invocation log — INSERT to call a function (business-layer, metered) |
| `useDeletePlatformFunctionInvocationMutation` | Mutation | Function invocation log — INSERT to call a function (business-layer, metered) |
| `useScheduledJobsQuery` | Query | Recurring/cron-style job definitions: each row spawns jobs on a schedule, optionally scoped to a database |
| `useScheduledJobQuery` | Query | Recurring/cron-style job definitions: each row spawns jobs on a schedule, optionally scoped to a database |
| `useCreateScheduledJobMutation` | Mutation | Recurring/cron-style job definitions: each row spawns jobs on a schedule, optionally scoped to a database |
| `useUpdateScheduledJobMutation` | Mutation | Recurring/cron-style job definitions: each row spawns jobs on a schedule, optionally scoped to a database |
| `useDeleteScheduledJobMutation` | Mutation | Recurring/cron-style job definitions: each row spawns jobs on a schedule, optionally scoped to a database |
| `usePlatformNamespaceEventsQuery` | Query | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `usePlatformNamespaceEventQuery` | Query | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `useCreatePlatformNamespaceEventMutation` | Mutation | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `useUpdatePlatformNamespaceEventMutation` | Mutation | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `useDeletePlatformNamespaceEventMutation` | Mutation | Namespace lifecycle events — audit log of creation, activation, deactivation, label changes |
| `useJobsQuery` | Query | Background job queue: each row is a pending or in-progress task, optionally scoped to a database |
| `useJobQuery` | Query | Background job queue: each row is a pending or in-progress task, optionally scoped to a database |
| `useCreateJobMutation` | Mutation | Background job queue: each row is a pending or in-progress task, optionally scoped to a database |
| `useUpdateJobMutation` | Mutation | Background job queue: each row is a pending or in-progress task, optionally scoped to a database |
| `useDeleteJobMutation` | Mutation | Background job queue: each row is a pending or in-progress task, optionally scoped to a database |
| `usePlatformFunctionDefinitionsQuery` | Query | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `usePlatformFunctionDefinitionQuery` | Query | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `useCreatePlatformFunctionDefinitionMutation` | Mutation | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `useUpdatePlatformFunctionDefinitionMutation` | Mutation | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `useDeletePlatformFunctionDefinitionMutation` | Mutation | Function definitions — registered cloud functions with routing, queue, and retry configuration |
| `useReleaseJobsMutation` | Mutation | releaseJobs |
| `useForceUnlockWorkersMutation` | Mutation | forceUnlockWorkers |
| `useJsonBuildObjectApplyMutation` | Mutation | jsonBuildObjectApply |
| `useReleaseScheduledJobsMutation` | Mutation | releaseScheduledJobs |
| `useGetScheduledJobMutation` | Mutation | getScheduledJob |
| `useAddScheduledJobMutation` | Mutation | addScheduledJob |
| `useCompleteJobsMutation` | Mutation | completeJobs |
| `useRemoveJobMutation` | Mutation | removeJob |
| `useCompleteJobMutation` | Mutation | completeJob |
| `usePermanentlyFailJobsMutation` | Mutation | permanentlyFailJobs |
| `useFailJobMutation` | Mutation | failJob |
| `useRescheduleJobsMutation` | Mutation | rescheduleJobs |
| `useAddJobMutation` | Mutation | addJob |
| `useRunScheduledJobMutation` | Mutation | runScheduledJob |
| `useGetJobMutation` | Mutation | getJob |
| `useProvisionBucketMutation` | Mutation | Provision an S3 bucket for a logical bucket in the database.
Reads the bucket config via RLS, then creates and configures
the S3 bucket with the appropriate privacy policies, CORS rules,
and lifecycle settings. |

## Table Hooks

### PlatformSecretValue

```typescript
// List all platformSecretValues
const { data, isLoading } = usePlatformSecretValuesQuery({
  selection: { fields: { id: true, secretName: true, configuredValue: true, databaseId: true, createdAt: true, updatedAt: true } },
});

// Get one platformSecretValue
const { data: item } = usePlatformSecretValueQuery({
  id: '<UUID>',
  selection: { fields: { id: true, secretName: true, configuredValue: true, databaseId: true, createdAt: true, updatedAt: true } },
});

// Create a platformSecretValue
const { mutate: create } = useCreatePlatformSecretValueMutation({
  selection: { fields: { id: true } },
});
create({ secretName: '<String>', configuredValue: '<String>', databaseId: '<UUID>' });
```

### JobQueue

```typescript
// List all jobQueues
const { data, isLoading } = useJobQueuesQuery({
  selection: { fields: { queueName: true, jobCount: true, lockedAt: true, lockedBy: true } },
});

// Get one jobQueue
const { data: item } = useJobQueueQuery({
  queueName: '<String>',
  selection: { fields: { queueName: true, jobCount: true, lockedAt: true, lockedBy: true } },
});

// Create a jobQueue
const { mutate: create } = useCreateJobQueueMutation({
  selection: { fields: { queueName: true } },
});
create({ jobCount: '<Int>', lockedAt: '<Datetime>', lockedBy: '<String>' });
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

### PlatformFunctionInvocation

```typescript
// List all platformFunctionInvocations
const { data, isLoading } = usePlatformFunctionInvocationsQuery({
  selection: { fields: { createdAt: true, actorId: true, completedAt: true, databaseId: true, durationMs: true, error: true, functionId: true, id: true, jobId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } },
});

// Get one platformFunctionInvocation
const { data: item } = usePlatformFunctionInvocationQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, actorId: true, completedAt: true, databaseId: true, durationMs: true, error: true, functionId: true, id: true, jobId: true, payload: true, result: true, startedAt: true, status: true, taskIdentifier: true } },
});

// Create a platformFunctionInvocation
const { mutate: create } = useCreatePlatformFunctionInvocationMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', completedAt: '<Datetime>', databaseId: '<UUID>', durationMs: '<Int>', error: '<String>', functionId: '<UUID>', jobId: '<BigInt>', payload: '<JSON>', result: '<JSON>', startedAt: '<Datetime>', status: '<String>', taskIdentifier: '<String>' });
```

### ScheduledJob

```typescript
// List all scheduledJobs
const { data, isLoading } = useScheduledJobsQuery({
  selection: { fields: { id: true, databaseId: true, actorId: true, entityId: true, queueName: true, taskIdentifier: true, payload: true, priority: true, maxAttempts: true, key: true, lockedAt: true, lockedBy: true, scheduleInfo: true, lastScheduled: true, lastScheduledId: true } },
});

// Get one scheduledJob
const { data: item } = useScheduledJobQuery({
  id: '<BigInt>',
  selection: { fields: { id: true, databaseId: true, actorId: true, entityId: true, queueName: true, taskIdentifier: true, payload: true, priority: true, maxAttempts: true, key: true, lockedAt: true, lockedBy: true, scheduleInfo: true, lastScheduled: true, lastScheduledId: true } },
});

// Create a scheduledJob
const { mutate: create } = useCreateScheduledJobMutation({
  selection: { fields: { id: true } },
});
create({ databaseId: '<UUID>', actorId: '<UUID>', entityId: '<UUID>', queueName: '<String>', taskIdentifier: '<String>', payload: '<JSON>', priority: '<Int>', maxAttempts: '<Int>', key: '<String>', lockedAt: '<Datetime>', lockedBy: '<String>', scheduleInfo: '<JSON>', lastScheduled: '<Datetime>', lastScheduledId: '<BigInt>' });
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

### Job

```typescript
// List all jobs
const { data, isLoading } = useJobsQuery({
  selection: { fields: { id: true, databaseId: true, actorId: true, entityId: true, organizationId: true, entityType: true, queueName: true, taskIdentifier: true, payload: true, priority: true, runAt: true, attempts: true, maxAttempts: true, key: true, lastError: true, lockedAt: true, lockedBy: true, isAvailable: true, createdAt: true, updatedAt: true } },
});

// Get one job
const { data: item } = useJobQuery({
  id: '<BigInt>',
  selection: { fields: { id: true, databaseId: true, actorId: true, entityId: true, organizationId: true, entityType: true, queueName: true, taskIdentifier: true, payload: true, priority: true, runAt: true, attempts: true, maxAttempts: true, key: true, lastError: true, lockedAt: true, lockedBy: true, isAvailable: true, createdAt: true, updatedAt: true } },
});

// Create a job
const { mutate: create } = useCreateJobMutation({
  selection: { fields: { id: true } },
});
create({ databaseId: '<UUID>', actorId: '<UUID>', entityId: '<UUID>', organizationId: '<UUID>', entityType: '<String>', queueName: '<String>', taskIdentifier: '<String>', payload: '<JSON>', priority: '<Int>', runAt: '<Datetime>', attempts: '<Int>', maxAttempts: '<Int>', key: '<String>', lastError: '<String>', lockedAt: '<Datetime>', lockedBy: '<String>', isAvailable: '<Boolean>' });
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

### `useReleaseJobsMutation`

releaseJobs

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ReleaseJobsInput (required) |

### `useForceUnlockWorkersMutation`

forceUnlockWorkers

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ForceUnlockWorkersInput (required) |

### `useJsonBuildObjectApplyMutation`

jsonBuildObjectApply

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | JsonBuildObjectApplyInput (required) |

### `useReleaseScheduledJobsMutation`

releaseScheduledJobs

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ReleaseScheduledJobsInput (required) |

### `useGetScheduledJobMutation`

getScheduledJob

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | GetScheduledJobInput (required) |

### `useAddScheduledJobMutation`

addScheduledJob

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AddScheduledJobInput (required) |

### `useCompleteJobsMutation`

completeJobs

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CompleteJobsInput (required) |

### `useRemoveJobMutation`

removeJob

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RemoveJobInput (required) |

### `useCompleteJobMutation`

completeJob

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CompleteJobInput (required) |

### `usePermanentlyFailJobsMutation`

permanentlyFailJobs

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | PermanentlyFailJobsInput (required) |

### `useFailJobMutation`

failJob

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | FailJobInput (required) |

### `useRescheduleJobsMutation`

rescheduleJobs

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RescheduleJobsInput (required) |

### `useAddJobMutation`

addJob

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AddJobInput (required) |

### `useRunScheduledJobMutation`

runScheduledJob

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RunScheduledJobInput (required) |

### `useGetJobMutation`

getJob

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | GetJobInput (required) |

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
