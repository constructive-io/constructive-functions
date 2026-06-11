# ref

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for Ref records via constructive-functions CLI (objects target)

## Usage

```bash
constructive-functions objects:ref list
constructive-functions objects:ref list --where.<field>.<op> <value> --orderBy <values>
constructive-functions objects:ref list --limit 10 --after <cursor>
constructive-functions objects:ref find-first --where.<field>.<op> <value>
constructive-functions objects:ref get --id <UUID>
constructive-functions objects:ref create --databaseId <UUID> --name <String> --storeId <UUID> [--commitId <UUID>]
constructive-functions objects:ref update --id <UUID> [--commitId <UUID>] [--databaseId <UUID>] [--name <String>] [--storeId <UUID>]
constructive-functions objects:ref delete --id <UUID>
```

## Examples

### List ref records

```bash
constructive-functions objects:ref list
```

### List ref records with pagination

```bash
constructive-functions objects:ref list --limit 10 --offset 0
```

### List ref records with cursor pagination

```bash
constructive-functions objects:ref list --limit 10 --after <cursor>
```

### Find first matching ref

```bash
constructive-functions objects:ref find-first --where.id.equalTo <value>
```

### List ref records with filtering and ordering

```bash
constructive-functions objects:ref list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a ref

```bash
constructive-functions objects:ref create --databaseId <UUID> --name <String> --storeId <UUID> [--commitId <UUID>]
```
