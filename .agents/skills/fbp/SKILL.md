---
name: fbp
description: Flow-Based Programming integration for the Constructive Functions platform. Maps FBP NodeDefinitions to platform_function_definitions and handler.json, enabling visual flow graphs where each function is a node with typed input/output ports.
---

# FBP Integration Skill

## When to Apply

Use this skill when:
- Mapping platform functions to FBP node definitions
- Building or modifying the Flow Graph UI
- Connecting function outputs to function inputs via edges
- Working with the `@fbp/spec` or `@fbp/types` packages in this repo

## Core Mapping

Each `platform_function_definition` row (from `constructive_compute_public.platform_function_definitions`) maps to an FBP `NodeDefinition`:

| Platform Field | FBP Field | Notes |
|---|---|---|
| `name` | `NodeDefinition.name` | e.g. `send-email` |
| `task_identifier` | `NodeDefinition.context` | e.g. `email:send_email` — acts as the dispatch key |
| `description` | `NodeDefinition.description` | Human-readable |
| `required_secrets` | `NodeDefinition.props[]` | Each secret becomes a `PropDef` with `required` flag |
| `required_configs` | `NodeDefinition.props[]` | Each config becomes a `PropDef` |
| `scope` | `NodeDefinition.category` | Groups nodes in the palette |

### Port Model

Functions have a single implicit input port (`payload`) and a single implicit output port (`result`):

```typescript
// Every function node has these ports by default
inputs:  [{ name: 'payload', type: 'json' }]
outputs: [{ name: 'result',  type: 'json' }]
```

An edge from `functionA.result` to `functionB.payload` means: "the output of job A is piped as the input payload of job B."

### handler.json → NodeDefinition

The `handler.json` manifest enriches the definition:

| handler.json Field | FBP Field |
|---|---|
| `name` | `NodeDefinition.name` |
| `version` | stored in `meta` |
| `type` | template type (not FBP type) |
| `port` | stored in `meta` (runtime detail) |
| `taskIdentifier` | `NodeDefinition.context` |
| `description` | `NodeDefinition.description` |
| `dependencies` | not mapped (build-time only) |

## FBP Spec Quick Reference

### Graph Structure

```typescript
interface Graph {
  name?: string;
  nodes: Node[];          // Function instances
  edges: Edge[];          // Data flow connections
  definitions?: NodeDefinition[];  // Available function types
}
```

### Edge (connection between functions)

```typescript
interface Edge {
  src: { node: string; port: string };  // e.g. { node: 'send-email', port: 'result' }
  dst: { node: string; port: string };  // e.g. { node: 'log-result', port: 'payload' }
}
```

### Node (function instance in a flow)

```typescript
interface Node {
  name: string;       // Instance name (unique within flow)
  type: string;       // References a NodeDefinition name
  meta?: { x?: number; y?: number; description?: string };
  props?: Array<{ name: string; value?: any }>;
}
```

## Persistence

Flows are stored as JSON objects conforming to the `Graph` interface. Initial implementation uses `localStorage`; production will use a database table.

## Source Packages

- `@fbp/spec` — Storage types + manipulation API (from `constructive-io/fbp`)
- `@fbp/types` — Core TypeScript type definitions
- `@fbp/graph-editor` — React visual editor component
- `@fbp/evaluator` — Graph execution engine
