# FBP Data Model & State Management

## 1. The Canonical Graph Format

Both `@fbp/types` (TypeScript) and `constructive-db` (SQL `import_graph_json` / `read_function_graph`) use **the same JSON structure**. Here's a complete annotated example:

```jsonc
{
  "name": "mixed-native-def",           // graph name (human-readable key)
  "context": "function",                 // namespace scope (always "function" for platform functions)

  // Optional: reusable node definitions (digital assets) — sub-graphs that can be
  // referenced by type name from any node. Think of them as "macros" or "components".
  "definitions": [
    {
      "name": "double",                  // referenced via node.type = "double"
      "context": "function",
      "category": "math",
      "inputs": [{ "name": "x", "type": "number" }],
      "outputs": [{ "name": "result", "type": "number" }],
      "graph": {                         // embedded sub-graph (recursive)
        "name": "double-internal",
        "context": "function",
        "nodes": [
          { "name": "input_x", "type": "graphInput", "props": [{ "name": "portName", "value": "x" }] },
          { "name": "mul", "type": "double_impl" },
          { "name": "output_result", "type": "graphOutput", "props": [{ "name": "portName", "value": "result" }] }
        ],
        "edges": [
          { "src": { "node": "input_x", "port": "value" }, "dst": { "node": "mul", "port": "x" } },
          { "src": { "node": "mul", "port": "result" }, "dst": { "node": "output_result", "port": "value" } }
        ]
      }
    }
  ],

  // Top-level graph
  "nodes": [
    // Boundary nodes — typed entry/exit points
    {
      "name": "input_x",
      "type": "graphInput",               // magic type: becomes an external input port
      "props": [
        { "name": "portName", "value": "x" },         // external port name
        { "name": "dataType", "value": "number" }      // optional type hint
      ]
    },
    {
      "name": "input_y",
      "type": "graphInput",
      "props": [
        { "name": "portName", "value": "y" },
        { "name": "dataType", "value": "number" }
      ]
    },
    {
      "name": "prop_scale",
      "type": "graphProp",                // magic type: configurable parameter (not a data port)
      "props": [
        { "name": "propName", "value": "scale" },
        { "name": "dataType", "value": "number" },
        { "name": "default", "value": 1.5 }
      ]
    },

    // Compute nodes
    { "name": "my_double", "type": "double" },          // resolved from definitions[]
    { "name": "adder", "type": "add" },                  // resolved from registered node types

    // Output boundary
    {
      "name": "output_result",
      "type": "graphOutput",
      "props": [
        { "name": "portName", "value": "result" },
        { "name": "dataType", "value": "number" }
      ]
    }
  ],

  "edges": [
    { "src": { "node": "input_x", "port": "value" }, "dst": { "node": "my_double", "port": "x" } },
    { "src": { "node": "my_double", "port": "result" }, "dst": { "node": "adder", "port": "a" } },
    { "src": { "node": "input_y", "port": "value" }, "dst": { "node": "adder", "port": "b" } },
    { "src": { "node": "adder", "port": "result" }, "dst": { "node": "output_result", "port": "value" } }
  ]
}
```

### Boundary Node Conventions

| Type          | Purpose                         | Key Props                     | Port         |
|---------------|--------------------------------|-------------------------------|--------------|
| `graphInput`  | External input → internal port | `portName`, `dataType`        | output `value` |
| `graphOutput` | Internal port → external output| `portName`, `dataType`        | input `value`  |
| `graphProp`   | Configurable parameter         | `propName`, `dataType`, `default` | output `value` |

### Subnet Nodes (Inline)

A node can contain `nodes[]` + `edges[]` directly (inline subnet):

```jsonc
{
  "name": "processor",
  "type": "subnet",                      // or any type — presence of nodes[] makes it a subnet
  "nodes": [
    { "name": "input_val", "type": "graphInput", "props": [{ "name": "portName", "value": "val" }] },
    { "name": "double", "type": "multiply", "props": [{ "name": "b", "value": 2 }] },
    { "name": "output_result", "type": "graphOutput", "props": [{ "name": "portName", "value": "result" }] }
  ],
  "edges": [
    { "src": { "node": "input_val", "port": "value" }, "dst": { "node": "double", "port": "a" } },
    { "src": { "node": "double", "port": "result" }, "dst": { "node": "output_result", "port": "value" } }
  ]
}
```

External edges wire to the subnet's boundary ports:
```json
{ "src": { "node": "input_x", "port": "value" }, "dst": { "node": "processor", "port": "val" } }
```

---

## 2. Type System Alignment

### @fbp/types (TypeScript)

```typescript
interface Graph {
  name: string;
  context?: string;
  definitions?: NodeDefinition[];
  inputs?: Port[];              // graph-level input declarations (optional)
  outputs?: Port[];             // graph-level output declarations (optional)
  props?: PropDefinition[];     // graph-level prop declarations (optional)
  nodes: Node[];
  edges: Edge[];
  groups?: Group[];
  meta?: Metadata;              // { x, y, description, ... }
}

interface Node {
  name: string;                 // unique within scope
  type: string;                 // references a NodeDefinition or boundary type
  context?: string;
  meta?: Metadata;              // position { x, y }
  props?: Prop[];               // instance config
  inputs?: Port[];              // override definition ports (optional)
  outputs?: Port[];
  nodes?: Node[];               // inline subnet children
  edges?: Edge[];               // inline subnet edges
}

interface Edge {
  src: { node: string; port: string };
  dst: { node: string; port: string };
}

interface NodeDefinition {
  context: string;
  name: string;
  category?: string;
  inputs?: Port[];
  outputs?: Port[];
  props?: PropDefinition[];
  graph?: Graph;                // embedded sub-graph (digital asset)
  icon?: string;
}
```

### constructive-db (SQL/Merkle)

The DB stores the same shape via `import_graph_json(scope_id, name, graph_json::jsonb)` and returns it via `read_function_graph(graph_id)`:

```
read_function_graph returns:
{
  name, context,
  nodes: [{ name, type, meta?, props? }],
  edges: [{ src: {node, port}, dst: {node, port} }],
  definitions: [{ name, context, category, inputs, outputs, graph: {...} }]
}
```

**Key:** The JSON format is identical. No transform needed between client and DB.

---

## 3. Merkle Tree Storage

The DB doesn't store graphs as flat JSON blobs. It decomposes them into a content-addressed Merkle tree:

```
                    ┌─ root tree_id ─┐
                    │                 │
              function/               │
            ├── graphs/               │
            │   └── my-graph/         │
            │       ├── nodes/        │
            │       │   ├── input_a   │  ← each is an object { type, props, meta }
            │       │   ├── add1      │
            │       │   └── output    │
            │       └── edges/        │
            │           ├── 0         │  ← { src: {node, port}, dst: {node, port} }
            │           └── 1         │
            └── definitions/          │
                └── double            │  ← { name, context, inputs, outputs, graph: {...} }
```

- Every node in the tree is content-addressed (UUID v5 from `sha256(data)`)
- Parent hashes change when children change → Merkle proof of integrity
- Deduplication is free (identical data → same hash → same row)
- Git-like commits: `graph_store` → `graph_ref` (branch "main") → `graph_commit` → `tree_id`

### Operations

| Function | Description |
|----------|-------------|
| `import_graph_json(scope_id, name, json)` | Bulk load from canonical JSON → Merkle tree |
| `read_function_graph(graph_id)` | Reconstitute Merkle tree → canonical JSON |
| `serialize_graph(graph_id)` | Export raw tree (path→data pairs) |
| `deserialize_graph(database_id, name, snapshot)` | Restore from raw tree snapshot |
| `add_node_and_save(graph_id, ...)` | Insert node + auto-commit |
| `add_edge_and_save(graph_id, ...)` | Insert edge + auto-commit |
| `add_node(scope_id, root_hash, ...)` | Insert node (no commit, returns new root) |
| `add_edge(scope_id, root_hash, ...)` | Insert edge (no commit, returns new root) |
| `save_graph(graph_id, root_hash, msg)` | Commit a root hash |
| `validate_function_graph(graph_id)` | Cycle detection, dangling edges, missing output |
| `copy_graph(graph_id)` | Clone a graph (new store) |
| `import_definitions(target, source_scope, source_commit, context_path)` | Copy definitions between graphs |

---

## 4. Execution Model

### Lifecycle

```
start_execution(graph_id, input_payload, output_node)
    │
    ├── Resolve graphInput nodes → pre-populate node_outputs with input values
    ├── Resolve graphProp nodes → pre-populate with defaults or overrides
    ├── Create execution row (status='running')
    └── tick_execution(exec_id)
          │
          ├── For each node not yet computed:
          │     ├── Check all incoming edges — are source nodes in node_outputs?
          │     │    No → skip (not ready)
          │     │    Yes → gather inputs from source output objects
          │     │
          │     ├── If type == 'graphOutput':
          │     │     Store inputs as output, mark node complete
          │     │     If this is the designated output_node → mark execution 'completed'
          │     │
          │     ├── If type has a definition with embedded graph:
          │     │     import_graph_json(def.graph) → start_execution(sub_graph, inputs,
          │     │       parent_execution_id=exec_id, parent_node_name=node_name)
          │     │     When sub-execution completes → complete_node(parent, node, outputs)
          │     │
          │     └── Otherwise (native/external node):
          │           INSERT INTO app_jobs.jobs with task_identifier = 'fbp:eval:{context}:{type}'
          │           payload = { execution_id, node_name, node_type, inputs }
          │
          └── Safety guards:
                tick_count >= max_ticks → fail TICK_LIMIT_EXCEEDED
                now() >= timeout_at    → fail EXECUTION_TIMEOUT
                pending_jobs >= max    → fail JOB_LIMIT_EXCEEDED
```

### Job Payload (what the worker receives)

```json
{
  "execution_id": "uuid",
  "node_name": "add1",
  "node_type": "add",
  "inputs": { "a": 5, "b": 3 }
}
```

Task identifier: `fbp:eval:function:add`

### Completing a Node

After a worker processes a job, it calls:
```sql
SELECT complete_node(execution_id, node_name, '{"result": 8}'::jsonb)
```

This:
1. Content-addresses the output data (sha256 → execution_outputs table)
2. Adds `node_name → output_id` to `execution.node_outputs`
3. Calls `tick_execution` again → may enqueue more jobs

### Execution State

```sql
function_graph_executions:
  id, graph_id, database_id,
  output_node, output_port,
  status: 'running' | 'completed' | 'failed',
  input_payload: jsonb,
  output_payload: jsonb,          -- final result
  node_outputs: jsonb,            -- { node_name: output_object_id, ... }
  execution_plan: jsonb,
  current_wave: int,
  tick_count: int,
  max_ticks: int,                 -- default 100
  max_pending_jobs: int,          -- default 50
  timeout_at: timestamptz,        -- default now() + 5 min
  parent_execution_id: uuid,      -- for sub-graph executions
  parent_node_name: text,
  error_code, error_message
```

---

## 5. Two Execution Engines — When to Use Which

| | @fbp/evaluator (client) | constructive-db graph_module (server) |
|---|---|---|
| **Where** | Browser / Node.js | PostgreSQL |
| **How** | Lazy pull from output node | Wave-based push from inputs |
| **Async** | Awaits each node impl | Enqueues jobs → workers call complete_node |
| **Subnets** | Recursive evaluate() | Spawns sub-execution with parent tracking |
| **Definitions** | Runtime lookup in definitions[] | Merkle tree lookup at `{context}/definitions/{type}` |
| **State** | In-memory cache (Map) | `function_graph_executions.node_outputs` (content-addressed) |
| **Best for** | Preview, prototyping, pure-function flows | Production, side-effects, long-running, auditable |

### Client Evaluation (Phase 1 — current)

```typescript
import { evaluate } from '@fbp/evaluator';

const result = await evaluate(graph, {
  definitions: [...builtinDefs, ...platformFnDefs],
  outputNode: 'output_result',
  outputPort: 'value',
  inputs: { x: 7 },
  props: { scale: 2 }
});
```

- Definitions need an `impl` function (not serializable — runtime only)
- Pure functions work perfectly; side-effect functions use stubs

### Server Evaluation (Phase 2)

```sql
-- Store graph
SELECT import_graph_json(database_id, 'my-flow', graph_json);
-- Execute
SELECT start_execution(graph_id, '{"x": 7}'::jsonb);
-- Workers process jobs, call complete_node
-- Final result in function_graph_executions.output_payload
```

---

## 6. State Management Design for the UI

### Layers

```
┌─────────────────────────────────────────┐
│ @fbp/graph-editor (or React Flow)       │  Rendering + interaction
│   State: reducer-managed Graph object   │
├─────────────────────────────────────────┤
│ Graph store (React state + persistence) │  Source of truth
│   - localStorage (Phase 1)              │
│   - import_graph_json / serialize       │
│     (Phase 2, via API)                  │
├─────────────────────────────────────────┤
│ Evaluation engine                       │
│   - @fbp/evaluator (Phase 1, client)    │
│   - start_execution (Phase 2, server)   │
├─────────────────────────────────────────┤
│ Definition registry                     │
│   - Built-in: math, core, ui, net defs  │
│   - Platform: GET /api/functions → defs │
│   - Graph-local: graph.definitions[]    │
│   - Shared library (Phase 2):           │
│     import_definitions between graphs   │
└─────────────────────────────────────────┘
```

### The Graph object IS the state

The canonical `Graph` JSON from `@fbp/types` is both the in-memory state and the serialization format. No transform needed:

```
UI edit → dispatch reducer action → new Graph → save to localStorage
Load → read localStorage → Graph → pass to <GraphEditor graph={...}>
```

Phase 2 adds:
```
Save → POST /api/graphs { graph_json } → import_graph_json(...)
Load → GET /api/graphs/:id → read_function_graph(id) → Graph
```

### Definition Resolution

Platform functions → NodeDefinition[] mapping:

```typescript
function platformFnToDefinition(fn: PlatformFunction): NodeDefinition {
  return {
    context: fn.scope || 'platform',
    name: fn.task_identifier || fn.name,
    category: 'functions',
    description: fn.description,
    // Phase 1: generic ports
    inputs: [{ name: 'payload', type: 'json' }],
    outputs: [{ name: 'result', type: 'json' }],
    // Phase 2: typed ports from handler.json
    // inputs: fn.handler_schema?.inputs ?? [...],
    // outputs: fn.handler_schema?.outputs ?? [...],
  };
}
```

For execution, add `impl`:
```typescript
const defWithImpl: NodeDefinitionWithImpl = {
  ...definition,
  impl: async (inputs) => {
    // Phase 1: stub
    return { result: inputs.payload ?? inputs };
    // Phase 2: POST /api/jobs → poll for result
  }
};
```

---

## 7. Summary: What Matches, What's Missing

### Already aligned (no work needed)
- Graph JSON format: `@fbp/types.Graph` ≡ `import_graph_json` input ≡ `read_function_graph` output
- Boundary nodes: `graphInput`, `graphOutput`, `graphProp` — same semantics everywhere
- Edge format: `{ src: { node, port }, dst: { node, port } }` — identical
- Definitions: `NodeDefinition` with embedded `graph` — same shape
- Subnet: `Node.nodes[]` + `Node.edges[]` — same pattern

### Phase 1 (current — client-side)
- [x] Graph state = `@fbp/types.Graph` in React state
- [x] Persistence = localStorage
- [x] Evaluation = `@fbp/evaluator` with stub impls
- [x] Definitions = built-in + platform functions (generic ports)

### Phase 2 (server-side)
- [ ] Persistence = `import_graph_json` / `read_function_graph` via API
- [ ] Evaluation = `start_execution` / `tick_execution` / `complete_node`
- [ ] Typed ports from `handler.json` → `inputs[]/outputs[]` on NodeDefinition
- [ ] Definition library (shared across graphs via `import_definitions`)
- [ ] Execution status tracking in UI (poll `function_graph_executions`)
