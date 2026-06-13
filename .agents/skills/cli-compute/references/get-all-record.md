# getAllRecord

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for GetAllRecord records via constructive-functions CLI (compute target)

## Usage

```bash
constructive-functions compute:get-all-record list
constructive-functions compute:get-all-record list --where.<field>.<op> <value> --orderBy <values>
constructive-functions compute:get-all-record list --limit 10 --after <cursor>
constructive-functions compute:get-all-record find-first --where.<field>.<op> <value>
constructive-functions compute:get-all-record get --id <UUID>
constructive-functions compute:get-all-record create --path <String> --data <JSON>
constructive-functions compute:get-all-record update --id <UUID> [--path <String>] [--data <JSON>]
constructive-functions compute:get-all-record delete --id <UUID>
```

## Examples

### List getAllRecord records

```bash
constructive-functions compute:get-all-record list
```

### List getAllRecord records with pagination

```bash
constructive-functions compute:get-all-record list --limit 10 --offset 0
```

### List getAllRecord records with cursor pagination

```bash
constructive-functions compute:get-all-record list --limit 10 --after <cursor>
```

### Find first matching getAllRecord

```bash
constructive-functions compute:get-all-record find-first --where.id.equalTo <value>
```

### List getAllRecord records with filtering and ordering

```bash
constructive-functions compute:get-all-record list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a getAllRecord

```bash
constructive-functions compute:get-all-record create --path <String> --data <JSON>
```
