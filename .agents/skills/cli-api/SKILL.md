---
name: cli-api
description: CLI commands for the api API target — 8 tables and 9 custom operations via constructive-functions
---

# cli-api

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CLI commands for the api API target — 8 tables and 9 custom operations via constructive-functions

## Usage

```bash
# CRUD for api tables (e.g. role-type)
constructive-functions api:role-type list
constructive-functions api:role-type get --id <value>
constructive-functions api:role-type create --<field> <value>

# Non-interactive mode (skip all prompts, use flags only)
constructive-functions --no-tty api:role-type list
```

## Examples

### Query api records

```bash
constructive-functions api:role-type list
```

### Non-interactive mode (for scripts and CI)

```bash
constructive-functions --no-tty api:role-type create --<field> <value>
```

## References

See the `references/` directory for detailed per-entity API documentation:

- [role-type](references/role-type.md)
- [platform-config-definition](references/platform-config-definition.md)
- [platform-namespace](references/platform-namespace.md)
- [platform-config](references/platform-config.md)
- [platform-bucket](references/platform-bucket.md)
- [platform-file](references/platform-file.md)
- [user](references/user.md)
- [platform-namespace-event](references/platform-namespace-event.md)
- [platform-secrets-del](references/platform-secrets-del.md)
- [platform-secrets-set](references/platform-secrets-set.md)
- [org-secrets-del](references/org-secrets-del.md)
- [org-secrets-set](references/org-secrets-set.md)
- [org-secrets-remove-array](references/org-secrets-remove-array.md)
- [platform-files-rename](references/platform-files-rename.md)
- [upload-platform-file](references/upload-platform-file.md)
- [upload-platform-files](references/upload-platform-files.md)
- [provision-bucket](references/provision-bucket.md)
