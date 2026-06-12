# platformComputeLog

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformComputeLog records via constructive-functions CLI (compute target)

## Usage

```bash
constructive-functions compute:platform-compute-log list
constructive-functions compute:platform-compute-log list --where.<field>.<op> <value> --orderBy <values>
constructive-functions compute:platform-compute-log list --limit 10 --after <cursor>
constructive-functions compute:platform-compute-log find-first --where.<field>.<op> <value>
constructive-functions compute:platform-compute-log get --id <UUID>
constructive-functions compute:platform-compute-log create --taskIdentifier <String> --jobId <BigInt> --status <String> --durationMs <Int> [--completedAt <Datetime>] [--databaseId <UUID>] [--entityId <UUID>] [--organizationId <UUID>] [--entityType <String>] [--actorId <UUID>] [--invocationId <UUID>] [--error <String>]
constructive-functions compute:platform-compute-log update --id <UUID> [--completedAt <Datetime>] [--databaseId <UUID>] [--entityId <UUID>] [--organizationId <UUID>] [--entityType <String>] [--actorId <UUID>] [--taskIdentifier <String>] [--jobId <BigInt>] [--invocationId <UUID>] [--status <String>] [--durationMs <Int>] [--error <String>]
constructive-functions compute:platform-compute-log delete --id <UUID>
```

## Examples

### List platformComputeLog records

```bash
constructive-functions compute:platform-compute-log list
```

### List platformComputeLog records with pagination

```bash
constructive-functions compute:platform-compute-log list --limit 10 --offset 0
```

### List platformComputeLog records with cursor pagination

```bash
constructive-functions compute:platform-compute-log list --limit 10 --after <cursor>
```

### Find first matching platformComputeLog

```bash
constructive-functions compute:platform-compute-log find-first --where.id.equalTo <value>
```

### List platformComputeLog records with filtering and ordering

```bash
constructive-functions compute:platform-compute-log list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformComputeLog

```bash
constructive-functions compute:platform-compute-log create --taskIdentifier <String> --jobId <BigInt> --status <String> --durationMs <Int> [--completedAt <Datetime>] [--databaseId <UUID>] [--entityId <UUID>] [--organizationId <UUID>] [--entityType <String>] [--actorId <UUID>] [--invocationId <UUID>] [--error <String>]
```
