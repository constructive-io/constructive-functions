# platformFunctionInvocation

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformFunctionInvocation records via constructive-functions CLI (compute target)

## Usage

```bash
constructive-functions compute:platform-function-invocation list
constructive-functions compute:platform-function-invocation list --where.<field>.<op> <value> --orderBy <values>
constructive-functions compute:platform-function-invocation list --limit 10 --after <cursor>
constructive-functions compute:platform-function-invocation find-first --where.<field>.<op> <value>
constructive-functions compute:platform-function-invocation get --id <UUID>
constructive-functions compute:platform-function-invocation create --databaseId <UUID> --taskIdentifier <String> [--actorId <UUID>] [--completedAt <Datetime>] [--durationMs <Int>] [--error <String>] [--graphExecutionId <UUID>] [--jobId <BigInt>] [--parentInvocationId <UUID>] [--payload <JSON>] [--result <JSON>] [--startedAt <Datetime>] [--status <String>]
constructive-functions compute:platform-function-invocation update --id <UUID> [--actorId <UUID>] [--completedAt <Datetime>] [--databaseId <UUID>] [--durationMs <Int>] [--error <String>] [--graphExecutionId <UUID>] [--jobId <BigInt>] [--parentInvocationId <UUID>] [--payload <JSON>] [--result <JSON>] [--startedAt <Datetime>] [--status <String>] [--taskIdentifier <String>]
constructive-functions compute:platform-function-invocation delete --id <UUID>
```

## Examples

### List platformFunctionInvocation records

```bash
constructive-functions compute:platform-function-invocation list
```

### List platformFunctionInvocation records with pagination

```bash
constructive-functions compute:platform-function-invocation list --limit 10 --offset 0
```

### List platformFunctionInvocation records with cursor pagination

```bash
constructive-functions compute:platform-function-invocation list --limit 10 --after <cursor>
```

### Find first matching platformFunctionInvocation

```bash
constructive-functions compute:platform-function-invocation find-first --where.id.equalTo <value>
```

### List platformFunctionInvocation records with filtering and ordering

```bash
constructive-functions compute:platform-function-invocation list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformFunctionInvocation

```bash
constructive-functions compute:platform-function-invocation create --databaseId <UUID> --taskIdentifier <String> [--actorId <UUID>] [--completedAt <Datetime>] [--durationMs <Int>] [--error <String>] [--graphExecutionId <UUID>] [--jobId <BigInt>] [--parentInvocationId <UUID>] [--payload <JSON>] [--result <JSON>] [--startedAt <Datetime>] [--status <String>]
```
