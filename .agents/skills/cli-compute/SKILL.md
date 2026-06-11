---
name: cli-compute
description: CLI commands for the compute API target — 12 tables and 16 custom operations via constructive-functions
---

# cli-compute

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

CLI commands for the compute API target — 12 tables and 16 custom operations via constructive-functions

## Usage

```bash
# CRUD for compute tables (e.g. get-all-record)
constructive-functions compute:get-all-record list
constructive-functions compute:get-all-record get --id <value>
constructive-functions compute:get-all-record create --<field> <value>

# Non-interactive mode (skip all prompts, use flags only)
constructive-functions --no-tty compute:get-all-record list
```

## Examples

### Query compute records

```bash
constructive-functions compute:get-all-record list
```

### Non-interactive mode (for scripts and CI)

```bash
constructive-functions --no-tty compute:get-all-record create --<field> <value>
```

## References

See the `references/` directory for detailed per-entity API documentation:

- [get-all-record](references/get-all-record.md)
- [platform-function-graph-ref](references/platform-function-graph-ref.md)
- [platform-function-graph-store](references/platform-function-graph-store.md)
- [platform-function-graph-object](references/platform-function-graph-object.md)
- [org-function-execution-log](references/org-function-execution-log.md)
- [platform-function-graph-commit](references/platform-function-graph-commit.md)
- [platform-secret-definition](references/platform-secret-definition.md)
- [platform-function-execution-log](references/platform-function-execution-log.md)
- [platform-function-graph](references/platform-function-graph.md)
- [org-function-invocation](references/org-function-invocation.md)
- [platform-function-invocation](references/platform-function-invocation.md)
- [platform-function-definition](references/platform-function-definition.md)
- [platform-read-function-graph](references/platform-read-function-graph.md)
- [platform-validate-function-graph](references/platform-validate-function-graph.md)
- [init-empty-repo](references/init-empty-repo.md)
- [platform-import-definitions](references/platform-import-definitions.md)
- [set-data-at-path](references/set-data-at-path.md)
- [platform-copy-graph](references/platform-copy-graph.md)
- [platform-save-graph](references/platform-save-graph.md)
- [platform-add-edge-and-save](references/platform-add-edge-and-save.md)
- [platform-add-node-and-save](references/platform-add-node-and-save.md)
- [platform-create-function-graph](references/platform-create-function-graph.md)
- [platform-add-edge](references/platform-add-edge.md)
- [platform-add-node](references/platform-add-node.md)
- [platform-import-graph-json](references/platform-import-graph-json.md)
- [insert-node-at-path](references/insert-node-at-path.md)
- [platform-start-execution](references/platform-start-execution.md)
- [provision-bucket](references/provision-bucket.md)
