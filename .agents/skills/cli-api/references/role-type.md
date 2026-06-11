# roleType

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for RoleType records via constructive-functions CLI (api target)

## Usage

```bash
constructive-functions api:role-type list
constructive-functions api:role-type list --where.<field>.<op> <value> --orderBy <values>
constructive-functions api:role-type list --limit 10 --after <cursor>
constructive-functions api:role-type find-first --where.<field>.<op> <value>
constructive-functions api:role-type get --id <Int>
constructive-functions api:role-type create --name <String>
constructive-functions api:role-type update --id <Int> [--name <String>]
constructive-functions api:role-type delete --id <Int>
```

## Examples

### List roleType records

```bash
constructive-functions api:role-type list
```

### List roleType records with pagination

```bash
constructive-functions api:role-type list --limit 10 --offset 0
```

### List roleType records with cursor pagination

```bash
constructive-functions api:role-type list --limit 10 --after <cursor>
```

### Find first matching roleType

```bash
constructive-functions api:role-type find-first --where.id.equalTo <value>
```

### List roleType records with filtering and ordering

```bash
constructive-functions api:role-type list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a roleType

```bash
constructive-functions api:role-type create --name <String>
```
