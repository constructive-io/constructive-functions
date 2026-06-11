# platformSecretDefinition

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CRUD operations for PlatformSecretDefinition records via constructive-functions CLI (compute target)

## Usage

```bash
constructive-functions compute:platform-secret-definition list
constructive-functions compute:platform-secret-definition list --where.<field>.<op> <value> --orderBy <values>
constructive-functions compute:platform-secret-definition list --limit 10 --after <cursor>
constructive-functions compute:platform-secret-definition find-first --where.<field>.<op> <value>
constructive-functions compute:platform-secret-definition get --id <UUID>
constructive-functions compute:platform-secret-definition create --databaseId <UUID> --name <String> [--annotations <JSON>] [--description <String>] [--isBuiltIn <Boolean>] [--labels <JSON>]
constructive-functions compute:platform-secret-definition update --id <UUID> [--annotations <JSON>] [--databaseId <UUID>] [--description <String>] [--isBuiltIn <Boolean>] [--labels <JSON>] [--name <String>]
constructive-functions compute:platform-secret-definition delete --id <UUID>
```

## Examples

### List platformSecretDefinition records

```bash
constructive-functions compute:platform-secret-definition list
```

### List platformSecretDefinition records with pagination

```bash
constructive-functions compute:platform-secret-definition list --limit 10 --offset 0
```

### List platformSecretDefinition records with cursor pagination

```bash
constructive-functions compute:platform-secret-definition list --limit 10 --after <cursor>
```

### Find first matching platformSecretDefinition

```bash
constructive-functions compute:platform-secret-definition find-first --where.id.equalTo <value>
```

### List platformSecretDefinition records with filtering and ordering

```bash
constructive-functions compute:platform-secret-definition list --where.id.equalTo <value> --orderBy ID_ASC
```

### Create a platformSecretDefinition

```bash
constructive-functions compute:platform-secret-definition create --databaseId <UUID> --name <String> [--annotations <JSON>] [--description <String>] [--isBuiltIn <Boolean>] [--labels <JSON>]
```
