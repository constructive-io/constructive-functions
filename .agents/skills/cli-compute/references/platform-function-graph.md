# platformFunctionGraph

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformFunctionGraph records via constructive-functions CLI (compute target)

## Usage

```bash
constructive-functions compute:platform-function-graph list
constructive-functions compute:platform-function-graph list --where.<field>.<op> <value> --orderBy <values>
constructive-functions compute:platform-function-graph list --limit 10 --after <cursor>
constructive-functions compute:platform-function-graph find-first --where.<field>.<op> <value>
constructive-functions compute:platform-function-graph get --id <UUID>
constructive-functions compute:platform-function-graph create --databaseId <UUID> --name <String> --storeId <UUID> [--context <String>] [--createdBy <UUID>] [--definitionsCommitId <UUID>] [--description <String>] [--entityId <UUID>] [--isValid <Boolean>] [--validationErrors <JSON>]
constructive-functions compute:platform-function-graph update --id <UUID> [--context <String>] [--createdBy <UUID>] [--databaseId <UUID>] [--definitionsCommitId <UUID>] [--description <String>] [--entityId <UUID>] [--isValid <Boolean>] [--name <String>] [--storeId <UUID>] [--validationErrors <JSON>]
constructive-functions compute:platform-function-graph delete --id <UUID>
```

## Examples

### List platformFunctionGraph records

```bash
constructive-functions compute:platform-function-graph list
```

### List platformFunctionGraph records with pagination

```bash
constructive-functions compute:platform-function-graph list --limit 10 --offset 0
```

### List platformFunctionGraph records with cursor pagination

```bash
constructive-functions compute:platform-function-graph list --limit 10 --after <cursor>
```

### Find first matching platformFunctionGraph

```bash
constructive-functions compute:platform-function-graph find-first --where.id.equalTo <value>
```

### List platformFunctionGraph records with filtering and ordering

```bash
constructive-functions compute:platform-function-graph list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformFunctionGraph

```bash
constructive-functions compute:platform-function-graph create --databaseId <UUID> --name <String> --storeId <UUID> [--context <String>] [--createdBy <UUID>] [--definitionsCommitId <UUID>] [--description <String>] [--entityId <UUID>] [--isValid <Boolean>] [--validationErrors <JSON>]
```
