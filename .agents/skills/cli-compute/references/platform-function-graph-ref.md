# platformFunctionGraphRef

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformFunctionGraphRef records via constructive-functions CLI (compute target)

## Usage

```bash
constructive-functions compute:platform-function-graph-ref list
constructive-functions compute:platform-function-graph-ref list --where.<field>.<op> <value> --orderBy <values>
constructive-functions compute:platform-function-graph-ref list --limit 10 --after <cursor>
constructive-functions compute:platform-function-graph-ref find-first --where.<field>.<op> <value>
constructive-functions compute:platform-function-graph-ref get --id <UUID>
constructive-functions compute:platform-function-graph-ref create --databaseId <UUID> --name <String> --storeId <UUID> [--commitId <UUID>]
constructive-functions compute:platform-function-graph-ref update --id <UUID> [--commitId <UUID>] [--databaseId <UUID>] [--name <String>] [--storeId <UUID>]
constructive-functions compute:platform-function-graph-ref delete --id <UUID>
```

## Examples

### List platformFunctionGraphRef records

```bash
constructive-functions compute:platform-function-graph-ref list
```

### List platformFunctionGraphRef records with pagination

```bash
constructive-functions compute:platform-function-graph-ref list --limit 10 --offset 0
```

### List platformFunctionGraphRef records with cursor pagination

```bash
constructive-functions compute:platform-function-graph-ref list --limit 10 --after <cursor>
```

### Find first matching platformFunctionGraphRef

```bash
constructive-functions compute:platform-function-graph-ref find-first --where.id.equalTo <value>
```

### List platformFunctionGraphRef records with filtering and ordering

```bash
constructive-functions compute:platform-function-graph-ref list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformFunctionGraphRef

```bash
constructive-functions compute:platform-function-graph-ref create --databaseId <UUID> --name <String> --storeId <UUID> [--commitId <UUID>]
```
