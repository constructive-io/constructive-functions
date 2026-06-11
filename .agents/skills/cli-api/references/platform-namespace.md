# platformNamespace

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformNamespace records via constructive-functions CLI (api target)

## Usage

```bash
constructive-functions api:platform-namespace list
constructive-functions api:platform-namespace list --where.<field>.<op> <value> --orderBy <values>
constructive-functions api:platform-namespace list --limit 10 --after <cursor>
constructive-functions api:platform-namespace find-first --where.<field>.<op> <value>
constructive-functions api:platform-namespace get --id <UUID>
constructive-functions api:platform-namespace create --databaseId <UUID> --name <String> --namespaceName <String> [--annotations <JSON>] [--description <String>] [--isActive <Boolean>] [--labels <JSON>]
constructive-functions api:platform-namespace update --id <UUID> [--annotations <JSON>] [--databaseId <UUID>] [--description <String>] [--isActive <Boolean>] [--labels <JSON>] [--name <String>] [--namespaceName <String>]
constructive-functions api:platform-namespace delete --id <UUID>
```

## Examples

### List platformNamespace records

```bash
constructive-functions api:platform-namespace list
```

### List platformNamespace records with pagination

```bash
constructive-functions api:platform-namespace list --limit 10 --offset 0
```

### List platformNamespace records with cursor pagination

```bash
constructive-functions api:platform-namespace list --limit 10 --after <cursor>
```

### Find first matching platformNamespace

```bash
constructive-functions api:platform-namespace find-first --where.id.equalTo <value>
```

### List platformNamespace records with filtering and ordering

```bash
constructive-functions api:platform-namespace list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformNamespace

```bash
constructive-functions api:platform-namespace create --databaseId <UUID> --name <String> --namespaceName <String> [--annotations <JSON>] [--description <String>] [--isActive <Boolean>] [--labels <JSON>]
```
