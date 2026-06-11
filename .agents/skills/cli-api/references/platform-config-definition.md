# platformConfigDefinition

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformConfigDefinition records via constructive-functions CLI (api target)

## Usage

```bash
constructive-functions api:platform-config-definition list
constructive-functions api:platform-config-definition list --where.<field>.<op> <value> --orderBy <values>
constructive-functions api:platform-config-definition list --limit 10 --after <cursor>
constructive-functions api:platform-config-definition find-first --where.<field>.<op> <value>
constructive-functions api:platform-config-definition get --id <UUID>
constructive-functions api:platform-config-definition create --name <String> [--annotations <JSON>] [--defaultValue <String>] [--description <String>] [--isBuiltIn <Boolean>] [--labels <JSON>]
constructive-functions api:platform-config-definition update --id <UUID> [--annotations <JSON>] [--defaultValue <String>] [--description <String>] [--isBuiltIn <Boolean>] [--labels <JSON>] [--name <String>]
constructive-functions api:platform-config-definition delete --id <UUID>
```

## Examples

### List platformConfigDefinition records

```bash
constructive-functions api:platform-config-definition list
```

### List platformConfigDefinition records with pagination

```bash
constructive-functions api:platform-config-definition list --limit 10 --offset 0
```

### List platformConfigDefinition records with cursor pagination

```bash
constructive-functions api:platform-config-definition list --limit 10 --after <cursor>
```

### Find first matching platformConfigDefinition

```bash
constructive-functions api:platform-config-definition find-first --where.id.equalTo <value>
```

### List platformConfigDefinition records with filtering and ordering

```bash
constructive-functions api:platform-config-definition list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformConfigDefinition

```bash
constructive-functions api:platform-config-definition create --name <String> [--annotations <JSON>] [--defaultValue <String>] [--description <String>] [--isBuiltIn <Boolean>] [--labels <JSON>]
```
