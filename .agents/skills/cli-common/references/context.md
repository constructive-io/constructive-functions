# Context Management

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Manage API endpoint contexts for constructive-functions (multi-target: api, compute, objects)

## Usage

```bash
constructive-functions context create <name>
constructive-functions context list
constructive-functions context use <name>
constructive-functions context current
constructive-functions context delete <name>
```

## Examples

### Create a context for local development (accept all defaults)

```bash
constructive-functions context create local
constructive-functions context use local
```

### Create a production context with custom endpoints

```bash
constructive-functions context create production --api-endpoint <url> --compute-endpoint <url> --objects-endpoint <url>
constructive-functions context use production
```
