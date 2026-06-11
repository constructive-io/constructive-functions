# platformFunctionGraphStore

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformFunctionGraphStore records via constructive-functions CLI (compute target)

## Usage

```bash
constructive-functions compute:platform-function-graph-store list
constructive-functions compute:platform-function-graph-store list --where.<field>.<op> <value> --orderBy <values>
constructive-functions compute:platform-function-graph-store list --limit 10 --after <cursor>
constructive-functions compute:platform-function-graph-store find-first --where.<field>.<op> <value>
constructive-functions compute:platform-function-graph-store get --id <UUID>
constructive-functions compute:platform-function-graph-store create --databaseId <UUID> --name <String> [--hash <UUID>]
constructive-functions compute:platform-function-graph-store update --id <UUID> [--databaseId <UUID>] [--hash <UUID>] [--name <String>]
constructive-functions compute:platform-function-graph-store delete --id <UUID>
```

## Examples

### List platformFunctionGraphStore records

```bash
constructive-functions compute:platform-function-graph-store list
```

### List platformFunctionGraphStore records with pagination

```bash
constructive-functions compute:platform-function-graph-store list --limit 10 --offset 0
```

### List platformFunctionGraphStore records with cursor pagination

```bash
constructive-functions compute:platform-function-graph-store list --limit 10 --after <cursor>
```

### Find first matching platformFunctionGraphStore

```bash
constructive-functions compute:platform-function-graph-store find-first --where.id.equalTo <value>
```

### List platformFunctionGraphStore records with filtering and ordering

```bash
constructive-functions compute:platform-function-graph-store list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformFunctionGraphStore

```bash
constructive-functions compute:platform-function-graph-store create --databaseId <UUID> --name <String> [--hash <UUID>]
```
