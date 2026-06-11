# orgFunctionInvocation

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for OrgFunctionInvocation records via constructive-functions CLI (compute target)

## Usage

```bash
constructive-functions compute:org-function-invocation list
constructive-functions compute:org-function-invocation list --where.<field>.<op> <value> --orderBy <values>
constructive-functions compute:org-function-invocation list --limit 10 --after <cursor>
constructive-functions compute:org-function-invocation find-first --where.<field>.<op> <value>
constructive-functions compute:org-function-invocation get --id <UUID>
constructive-functions compute:org-function-invocation create --taskIdentifier <String> [--actorId <UUID>] [--completedAt <Datetime>] [--durationMs <Int>] [--error <String>] [--graphExecutionId <UUID>] [--jobId <BigInt>] [--parentInvocationId <UUID>] [--payload <JSON>] [--result <JSON>] [--startedAt <Datetime>] [--status <String>]
constructive-functions compute:org-function-invocation update --id <UUID> [--actorId <UUID>] [--completedAt <Datetime>] [--durationMs <Int>] [--error <String>] [--graphExecutionId <UUID>] [--jobId <BigInt>] [--parentInvocationId <UUID>] [--payload <JSON>] [--result <JSON>] [--startedAt <Datetime>] [--status <String>] [--taskIdentifier <String>]
constructive-functions compute:org-function-invocation delete --id <UUID>
```

## Examples

### List orgFunctionInvocation records

```bash
constructive-functions compute:org-function-invocation list
```

### List orgFunctionInvocation records with pagination

```bash
constructive-functions compute:org-function-invocation list --limit 10 --offset 0
```

### List orgFunctionInvocation records with cursor pagination

```bash
constructive-functions compute:org-function-invocation list --limit 10 --after <cursor>
```

### Find first matching orgFunctionInvocation

```bash
constructive-functions compute:org-function-invocation find-first --where.id.equalTo <value>
```

### List orgFunctionInvocation records with filtering and ordering

```bash
constructive-functions compute:org-function-invocation list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a orgFunctionInvocation

```bash
constructive-functions compute:org-function-invocation create --taskIdentifier <String> [--actorId <UUID>] [--completedAt <Datetime>] [--durationMs <Int>] [--error <String>] [--graphExecutionId <UUID>] [--jobId <BigInt>] [--parentInvocationId <UUID>] [--payload <JSON>] [--result <JSON>] [--startedAt <Datetime>] [--status <String>]
```
