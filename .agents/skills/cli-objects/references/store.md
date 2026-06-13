# store

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for Store records via constructive-functions CLI (objects target)

## Usage

```bash
constructive-functions objects:store list
constructive-functions objects:store list --where.<field>.<op> <value> --orderBy <values>
constructive-functions objects:store list --limit 10 --after <cursor>
constructive-functions objects:store find-first --where.<field>.<op> <value>
constructive-functions objects:store get --id <UUID>
constructive-functions objects:store create --databaseId <UUID> --name <String> [--hash <UUID>]
constructive-functions objects:store update --id <UUID> [--databaseId <UUID>] [--hash <UUID>] [--name <String>]
constructive-functions objects:store delete --id <UUID>
```

## Examples

### List store records

```bash
constructive-functions objects:store list
```

### List store records with pagination

```bash
constructive-functions objects:store list --limit 10 --offset 0
```

### List store records with cursor pagination

```bash
constructive-functions objects:store list --limit 10 --after <cursor>
```

### Find first matching store

```bash
constructive-functions objects:store find-first --where.id.equalTo <value>
```

### List store records with filtering and ordering

```bash
constructive-functions objects:store list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a store

```bash
constructive-functions objects:store create --databaseId <UUID> --name <String> [--hash <UUID>]
```
