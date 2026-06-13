# commit

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for Commit records via constructive-functions CLI (objects target)

## Usage

```bash
constructive-functions objects:commit list
constructive-functions objects:commit list --where.<field>.<op> <value> --orderBy <values>
constructive-functions objects:commit list --limit 10 --after <cursor>
constructive-functions objects:commit find-first --where.<field>.<op> <value>
constructive-functions objects:commit get --id <UUID>
constructive-functions objects:commit create --databaseId <UUID> --storeId <UUID> [--authorId <UUID>] [--committerId <UUID>] [--date <Datetime>] [--message <String>] [--parentIds <UUID>] [--treeId <UUID>]
constructive-functions objects:commit update --id <UUID> [--authorId <UUID>] [--committerId <UUID>] [--databaseId <UUID>] [--date <Datetime>] [--message <String>] [--parentIds <UUID>] [--storeId <UUID>] [--treeId <UUID>]
constructive-functions objects:commit delete --id <UUID>
```

## Examples

### List commit records

```bash
constructive-functions objects:commit list
```

### List commit records with pagination

```bash
constructive-functions objects:commit list --limit 10 --offset 0
```

### List commit records with cursor pagination

```bash
constructive-functions objects:commit list --limit 10 --after <cursor>
```

### Find first matching commit

```bash
constructive-functions objects:commit find-first --where.id.equalTo <value>
```

### List commit records with filtering and ordering

```bash
constructive-functions objects:commit list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a commit

```bash
constructive-functions objects:commit create --databaseId <UUID> --storeId <UUID> [--authorId <UUID>] [--committerId <UUID>] [--date <Datetime>] [--message <String>] [--parentIds <UUID>] [--treeId <UUID>]
```
