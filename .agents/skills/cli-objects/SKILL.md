---
name: cli-objects
description: CLI commands for the objects API target — 5 tables and 4 custom operations via constructive-functions
---

# cli-objects

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CLI commands for the objects API target — 5 tables and 4 custom operations via constructive-functions

## Usage

```bash
# CRUD for objects tables (e.g. get-all-record)
constructive-functions objects:get-all-record list
constructive-functions objects:get-all-record get --id <value>
constructive-functions objects:get-all-record create --<field> <value>

# Non-interactive mode (skip all prompts, use flags only)
constructive-functions --no-tty objects:get-all-record list
```

## Examples

### Query objects records

```bash
constructive-functions objects:get-all-record list
```

### Non-interactive mode (for scripts and CI)

```bash
constructive-functions --no-tty objects:get-all-record create --<field> <value>
```

## References

See the `references/` directory for detailed per-entity API documentation:

- [get-all-record](references/get-all-record.md)
- [store](references/store.md)
- [ref](references/ref.md)
- [object](references/object.md)
- [commit](references/commit.md)
- [init-empty-repo](references/init-empty-repo.md)
- [set-data-at-path](references/set-data-at-path.md)
- [insert-node-at-path](references/insert-node-at-path.md)
- [provision-bucket](references/provision-bucket.md)
