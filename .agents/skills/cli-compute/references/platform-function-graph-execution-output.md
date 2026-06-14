# platformFunctionGraphExecutionOutput

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformFunctionGraphExecutionOutput records via constructive-functions CLI (compute target)

## Usage

```bash
constructive-functions compute:platform-function-graph-execution-output list
constructive-functions compute:platform-function-graph-execution-output list --where.<field>.<op> <value> --orderBy <values>
constructive-functions compute:platform-function-graph-execution-output list --limit 10 --after <cursor>
constructive-functions compute:platform-function-graph-execution-output find-first --where.<field>.<op> <value>
constructive-functions compute:platform-function-graph-execution-output get --id <UUID>
constructive-functions compute:platform-function-graph-execution-output create --data <JSON> --databaseId <UUID> --hash <Base64EncodedBinary>
constructive-functions compute:platform-function-graph-execution-output update --id <UUID> [--data <JSON>] [--databaseId <UUID>] [--hash <Base64EncodedBinary>]
constructive-functions compute:platform-function-graph-execution-output delete --id <UUID>
```

## Examples

### List platformFunctionGraphExecutionOutput records

```bash
constructive-functions compute:platform-function-graph-execution-output list
```

### List platformFunctionGraphExecutionOutput records with pagination

```bash
constructive-functions compute:platform-function-graph-execution-output list --limit 10 --offset 0
```

### List platformFunctionGraphExecutionOutput records with cursor pagination

```bash
constructive-functions compute:platform-function-graph-execution-output list --limit 10 --after <cursor>
```

### Find first matching platformFunctionGraphExecutionOutput

```bash
constructive-functions compute:platform-function-graph-execution-output find-first --where.id.equalTo <value>
```

### List platformFunctionGraphExecutionOutput records with filtering and ordering

```bash
constructive-functions compute:platform-function-graph-execution-output list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformFunctionGraphExecutionOutput

```bash
constructive-functions compute:platform-function-graph-execution-output create --data <JSON> --databaseId <UUID> --hash <Base64EncodedBinary>
```
