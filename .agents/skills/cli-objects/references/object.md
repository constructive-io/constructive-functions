# object

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for Object records via constructive-functions CLI (objects target)

## Usage

```bash
constructive-functions objects:object list
constructive-functions objects:object list --where.<field>.<op> <value> --orderBy <values>
constructive-functions objects:object list --limit 10 --after <cursor>
constructive-functions objects:object find-first --where.<field>.<op> <value>
constructive-functions objects:object get --id <UUID>
constructive-functions objects:object create --databaseId <UUID> [--data <JSON>] [--kids <UUID>] [--ktree <String>]
constructive-functions objects:object update --id <UUID> [--data <JSON>] [--databaseId <UUID>] [--kids <UUID>] [--ktree <String>]
constructive-functions objects:object delete --id <UUID>
```

## Examples

### List object records

```bash
constructive-functions objects:object list
```

### List object records with pagination

```bash
constructive-functions objects:object list --limit 10 --offset 0
```

### List object records with cursor pagination

```bash
constructive-functions objects:object list --limit 10 --after <cursor>
```

### Find first matching object

```bash
constructive-functions objects:object find-first --where.id.equalTo <value>
```

### List object records with filtering and ordering

```bash
constructive-functions objects:object list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a object

```bash
constructive-functions objects:object create --databaseId <UUID> [--data <JSON>] [--kids <UUID>] [--ktree <String>]
```
