# FBP Integration with Constructive Functions

## Overview

This document describes how [Flow-Based Programming](https://en.wikipedia.org/wiki/Flow-based_programming) (FBP) concepts map onto the Constructive Functions platform, enabling visual flow graphs where each registered platform function becomes a draggable node with typed ports.

## Background

### Platform Function Definitions

Functions are registered in `constructive_infra_public.platform_function_definitions`:

```sql
CREATE TABLE platform_function_definitions (
  name              TEXT PRIMARY KEY,
  task_identifier   TEXT NOT NULL,     -- dispatch key, e.g. 'email:send_email'
  service_url       TEXT,
  is_invocable      BOOLEAN DEFAULT true,
  is_built_in       BOOLEAN DEFAULT false,
  scope             TEXT,              -- e.g. 'platform', 'app'
  description       TEXT,
  required_secrets  composite[],       -- (name, required) pairs
  required_configs  composite[],       -- (name, required) pairs
  namespace_id      UUID REFERENCES platform_namespaces(id),
  created_at        TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ
);
```

### handler.json Manifest

Each function's source directory contains a `handler.json`:

```json
{
  "name": "send-email",
  "version": "1.6.4",
  "type": "node-graphql",
  "port": 8081,
  "taskIdentifier": "email:send_email",
  "description": "Sends emails directly from job payload",
  "dependencies": { ... }
}
```

### FBP NodeDefinition (from `@fbp/types`)

```typescript
interface NodeDefinition {
  context: string;          // namespace, e.g. "email"
  name: string;             // e.g. "send-email"
  category?: string;        // palette group
  inputs?: PortDef[];       // input ports
  outputs?: PortDef[];      // output ports
  props?: PropDef[];        // configuration properties
  description?: string;
  icon?: string;
}
```

## Mapping: platform_function_definitions → NodeDefinition

### Direct Field Mapping

| DB Column / handler.json | NodeDefinition Field | Transformation |
|---|---|---|
| `name` | `name` | Direct copy |
| `task_identifier` | `context` | The `task_identifier` doubles as the FBP context (dispatch address) |
| `scope` | `category` | Groups functions in the visual palette |
| `description` | `description` | Direct copy |
| `required_secrets[]` | `props[]` | Each `(secret_name, required)` → `{ name, type: 'secret', required }` |
| `required_configs[]` | `props[]` | Each `(config_name, required)` → `{ name, type: 'config', required }` |

### Port Model

Every function has an identical port signature — one JSON input, one JSON output:

```
┌────────────────────────┐
│      send-email        │
│                        │
payload ──►│  handler(params, ctx)  │──► result
│                        │
└────────────────────────┘
```

```typescript
const toNodeDefinition = (fn: PlatformFunction): NodeDefinition => ({
  context: fn.task_identifier,
  name: fn.name,
  category: fn.scope || 'default',
  description: fn.description,
  inputs: [
    { name: 'payload', type: 'json', description: 'Job payload object' }
  ],
  outputs: [
    { name: 'result', type: 'json', description: 'Handler return value' }
  ],
  props: [
    ...fn.required_secrets.map(s => ({
      name: s.name,
      type: 'secret',
      required: s.required,
      description: `Secret: ${s.name}`
    })),
    ...fn.required_configs.map(c => ({
      name: c.name,
      type: 'config',
      required: c.required,
      description: `Config: ${c.name}`
    }))
  ]
});
```

### Edge Semantics

An edge connects one function's output to another's input:

```typescript
// "Pipe result of send-email into log-result"
{
  src: { node: 'send-email-1', port: 'result' },
  dst: { node: 'log-result-1',  port: 'payload' }
}
```

At runtime this means: when the job for `send-email-1` completes, its return value is used as the `payload` for a new job dispatched to `log-result-1`.

### Job Payload Flow

```
User triggers flow
  │
  ▼
Job A inserted into app_jobs.jobs
  │  task_identifier = fn_a.task_identifier
  │  payload = user-provided or upstream result
  │
  ▼
Worker picks up Job A → calls fn_a handler
  │
  ▼
fn_a returns { complete: true, data: {...} }
  │
  ▼
For each outgoing edge from fn_a:
  │  Insert new job with:
  │    task_identifier = edge.dst function's task_identifier
  │    payload = fn_a's result (or mapped subset)
  │
  ▼
Job B inserted → worker picks up → fn_b handler runs → ...
```

## Flow Graph (UI Model)

A flow is persisted as an FBP `Graph`:

```typescript
interface Flow {
  name: string;
  nodes: Array<{
    name: string;           // instance id, e.g. "send-email-1"
    type: string;           // function name, e.g. "send-email"
    meta?: { x: number; y: number };
    props?: Array<{ name: string; value?: any }>;
  }>;
  edges: Array<{
    src: { node: string; port: string };
    dst: { node: string; port: string };
  }>;
  definitions: NodeDefinition[];  // populated from GET /api/functions
}
```

### Persistence Strategy

| Phase | Storage | Notes |
|---|---|---|
| MVP | `localStorage` | Immediate, no backend changes needed |
| Production | DB table `constructive_infra_public.platform_flows` | Content-addressable via merkle hashing (aligned with `@fbp/spec` design) |

## Future Extensions

- **Typed ports**: Parse handler signatures to generate richer port schemas (beyond generic JSON)
- **Conditional routing**: Use FBP channels (`edge.channel`) for error vs. success paths
- **Subnets**: Compose flows of flows using FBP's nested graph model
- **Live execution**: Trigger a flow and watch job status propagate through the graph in real-time
- **Flow evaluation**: Use `@fbp/evaluator` to validate graphs before execution
