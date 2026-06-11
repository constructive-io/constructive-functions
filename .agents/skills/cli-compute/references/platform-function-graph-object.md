# platformFunctionGraphObject

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformFunctionGraphObject records via constructive-functions CLI (compute target)

## Usage

```bash
constructive-functions compute:platform-function-graph-object list
constructive-functions compute:platform-function-graph-object list --where.<field>.<op> <value> --orderBy <values>
constructive-functions compute:platform-function-graph-object list --limit 10 --after <cursor>
constructive-functions compute:platform-function-graph-object find-first --where.<field>.<op> <value>
constructive-functions compute:platform-function-graph-object get --id <UUID>
constructive-functions compute:platform-function-graph-object create --databaseId <UUID> [--data <JSON>] [--kids <UUID>] [--ktree <String>]
constructive-functions compute:platform-function-graph-object update --id <UUID> [--data <JSON>] [--databaseId <UUID>] [--kids <UUID>] [--ktree <String>]
constructive-functions compute:platform-function-graph-object delete --id <UUID>
```

## Examples

### List platformFunctionGraphObject records

```bash
constructive-functions compute:platform-function-graph-object list
```

### List platformFunctionGraphObject records with pagination

```bash
constructive-functions compute:platform-function-graph-object list --limit 10 --offset 0
```

### List platformFunctionGraphObject records with cursor pagination

```bash
constructive-functions compute:platform-function-graph-object list --limit 10 --after <cursor>
```

### Find first matching platformFunctionGraphObject

```bash
constructive-functions compute:platform-function-graph-object find-first --where.id.equalTo <value>
```

### List platformFunctionGraphObject records with filtering and ordering

```bash
constructive-functions compute:platform-function-graph-object list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformFunctionGraphObject

```bash
constructive-functions compute:platform-function-graph-object create --databaseId <UUID> [--data <JSON>] [--kids <UUID>] [--ktree <String>]
```
