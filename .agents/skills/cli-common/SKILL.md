---
name: cli-common
description: Shared CLI utilities for constructive-functions — context management, authentication, and config across targets: api, compute, objects
---

# cli-common

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Shared CLI utilities for constructive-functions — context management, authentication, and config across targets: api, compute, objects

## Usage

```bash
# Context management
constructive-functions context create <name>
constructive-functions context use <name>

# Authentication
constructive-functions auth set-token <token>
constructive-functions auth status

# Config variables
constructive-functions config set <key> <value>
constructive-functions config get <key>
constructive-functions config list
```

## Examples

### Set up and authenticate

```bash
constructive-functions context create local
constructive-functions context use local
constructive-functions auth set-token <token>
```

### Store a config variable

```bash
constructive-functions config set orgId abc-123
```

## References

See the `references/` directory for detailed per-entity API documentation:

- [context](references/context.md)
- [auth](references/auth.md)
- [config](references/config.md)
