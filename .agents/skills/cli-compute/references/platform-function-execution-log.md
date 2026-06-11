# platformFunctionExecutionLog

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformFunctionExecutionLog records via constructive-functions CLI (compute target)

## Usage

```bash
constructive-functions compute:platform-function-execution-log list
constructive-functions compute:platform-function-execution-log list --where.<field>.<op> <value> --orderBy <values>
constructive-functions compute:platform-function-execution-log list --limit 10 --after <cursor>
constructive-functions compute:platform-function-execution-log find-first --where.<field>.<op> <value>
constructive-functions compute:platform-function-execution-log get --id <UUID>
constructive-functions compute:platform-function-execution-log create --databaseId <UUID> --message <String> [--actorId <UUID>] [--invocationId <UUID>] [--logLevel <String>] [--metadata <JSON>] [--taskIdentifier <String>]
constructive-functions compute:platform-function-execution-log update --id <UUID> [--actorId <UUID>] [--databaseId <UUID>] [--invocationId <UUID>] [--logLevel <String>] [--message <String>] [--metadata <JSON>] [--taskIdentifier <String>]
constructive-functions compute:platform-function-execution-log delete --id <UUID>
```

## Examples

### List platformFunctionExecutionLog records

```bash
constructive-functions compute:platform-function-execution-log list
```

### List platformFunctionExecutionLog records with pagination

```bash
constructive-functions compute:platform-function-execution-log list --limit 10 --offset 0
```

### List platformFunctionExecutionLog records with cursor pagination

```bash
constructive-functions compute:platform-function-execution-log list --limit 10 --after <cursor>
```

### Find first matching platformFunctionExecutionLog

```bash
constructive-functions compute:platform-function-execution-log find-first --where.id.equalTo <value>
```

### List platformFunctionExecutionLog records with filtering and ordering

```bash
constructive-functions compute:platform-function-execution-log list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformFunctionExecutionLog

```bash
constructive-functions compute:platform-function-execution-log create --databaseId <UUID> --message <String> [--actorId <UUID>] [--invocationId <UUID>] [--logLevel <String>] [--metadata <JSON>] [--taskIdentifier <String>]
```
