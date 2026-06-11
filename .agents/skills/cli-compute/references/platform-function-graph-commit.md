# platformFunctionGraphCommit

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformFunctionGraphCommit records via constructive-functions CLI (compute target)

## Usage

```bash
constructive-functions compute:platform-function-graph-commit list
constructive-functions compute:platform-function-graph-commit list --where.<field>.<op> <value> --orderBy <values>
constructive-functions compute:platform-function-graph-commit list --limit 10 --after <cursor>
constructive-functions compute:platform-function-graph-commit find-first --where.<field>.<op> <value>
constructive-functions compute:platform-function-graph-commit get --id <UUID>
constructive-functions compute:platform-function-graph-commit create --databaseId <UUID> --storeId <UUID> [--authorId <UUID>] [--committerId <UUID>] [--date <Datetime>] [--message <String>] [--parentIds <UUID>] [--treeId <UUID>]
constructive-functions compute:platform-function-graph-commit update --id <UUID> [--authorId <UUID>] [--committerId <UUID>] [--databaseId <UUID>] [--date <Datetime>] [--message <String>] [--parentIds <UUID>] [--storeId <UUID>] [--treeId <UUID>]
constructive-functions compute:platform-function-graph-commit delete --id <UUID>
```

## Examples

### List platformFunctionGraphCommit records

```bash
constructive-functions compute:platform-function-graph-commit list
```

### List platformFunctionGraphCommit records with pagination

```bash
constructive-functions compute:platform-function-graph-commit list --limit 10 --offset 0
```

### List platformFunctionGraphCommit records with cursor pagination

```bash
constructive-functions compute:platform-function-graph-commit list --limit 10 --after <cursor>
```

### Find first matching platformFunctionGraphCommit

```bash
constructive-functions compute:platform-function-graph-commit find-first --where.id.equalTo <value>
```

### List platformFunctionGraphCommit records with filtering and ordering

```bash
constructive-functions compute:platform-function-graph-commit list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformFunctionGraphCommit

```bash
constructive-functions compute:platform-function-graph-commit create --databaseId <UUID> --storeId <UUID> [--authorId <UUID>] [--committerId <UUID>] [--date <Datetime>] [--message <String>] [--parentIds <UUID>] [--treeId <UUID>]
```
