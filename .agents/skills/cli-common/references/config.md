# Config Variables

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Manage per-context key-value configuration variables for constructive-functions

## Usage

```bash
constructive-functions config get <key>
constructive-functions config set <key> <value>
constructive-functions config list
constructive-functions config delete <key>
```

## Examples

### Store and retrieve a config variable

```bash
constructive-functions config set orgId abc-123
constructive-functions config get orgId
```

### List all config variables

```bash
constructive-functions config list
```
