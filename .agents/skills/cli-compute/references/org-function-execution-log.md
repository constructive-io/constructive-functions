# orgFunctionExecutionLog

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for OrgFunctionExecutionLog records via constructive-functions CLI (compute target)

## Usage

```bash
constructive-functions compute:org-function-execution-log list
constructive-functions compute:org-function-execution-log list --where.<field>.<op> <value> --orderBy <values>
constructive-functions compute:org-function-execution-log list --limit 10 --after <cursor>
constructive-functions compute:org-function-execution-log find-first --where.<field>.<op> <value>
constructive-functions compute:org-function-execution-log get --id <UUID>
constructive-functions compute:org-function-execution-log create --message <String> [--actorId <UUID>] [--invocationId <UUID>] [--logLevel <String>] [--metadata <JSON>] [--taskIdentifier <String>]
constructive-functions compute:org-function-execution-log update --id <UUID> [--actorId <UUID>] [--invocationId <UUID>] [--logLevel <String>] [--message <String>] [--metadata <JSON>] [--taskIdentifier <String>]
constructive-functions compute:org-function-execution-log delete --id <UUID>
```

## Examples

### List orgFunctionExecutionLog records

```bash
constructive-functions compute:org-function-execution-log list
```

### List orgFunctionExecutionLog records with pagination

```bash
constructive-functions compute:org-function-execution-log list --limit 10 --offset 0
```

### List orgFunctionExecutionLog records with cursor pagination

```bash
constructive-functions compute:org-function-execution-log list --limit 10 --after <cursor>
```

### Find first matching orgFunctionExecutionLog

```bash
constructive-functions compute:org-function-execution-log find-first --where.id.equalTo <value>
```

### List orgFunctionExecutionLog records with filtering and ordering

```bash
constructive-functions compute:org-function-execution-log list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a orgFunctionExecutionLog

```bash
constructive-functions compute:org-function-execution-log create --message <String> [--actorId <UUID>] [--invocationId <UUID>] [--logLevel <String>] [--metadata <JSON>] [--taskIdentifier <String>]
```
