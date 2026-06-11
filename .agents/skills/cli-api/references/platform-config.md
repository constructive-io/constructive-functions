# platformConfig

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformConfig records via constructive-functions CLI (api target)

## Usage

```bash
constructive-functions api:platform-config list
constructive-functions api:platform-config list --where.<field>.<op> <value> --orderBy <values>
constructive-functions api:platform-config list --limit 10 --after <cursor>
constructive-functions api:platform-config find-first --where.<field>.<op> <value>
constructive-functions api:platform-config get --id <UUID>
constructive-functions api:platform-config create --name <String> --namespaceId <UUID> [--annotations <JSON>] [--description <String>] [--expiresAt <Datetime>] [--labels <JSON>] [--value <String>]
constructive-functions api:platform-config update --id <UUID> [--annotations <JSON>] [--description <String>] [--expiresAt <Datetime>] [--labels <JSON>] [--name <String>] [--namespaceId <UUID>] [--value <String>]
constructive-functions api:platform-config delete --id <UUID>
```

## Examples

### List platformConfig records

```bash
constructive-functions api:platform-config list
```

### List platformConfig records with pagination

```bash
constructive-functions api:platform-config list --limit 10 --offset 0
```

### List platformConfig records with cursor pagination

```bash
constructive-functions api:platform-config list --limit 10 --after <cursor>
```

### Find first matching platformConfig

```bash
constructive-functions api:platform-config find-first --where.id.equalTo <value>
```

### List platformConfig records with filtering and ordering

```bash
constructive-functions api:platform-config list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformConfig

```bash
constructive-functions api:platform-config create --name <String> --namespaceId <UUID> [--annotations <JSON>] [--description <String>] [--expiresAt <Datetime>] [--labels <JSON>] [--value <String>]
```
