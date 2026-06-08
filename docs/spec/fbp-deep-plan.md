# FBP Integration Deep Plan

Full feature port from `@fbp/graph-editor` into `constructive-functions`, backed by `constructive-db` merkle storage + graph execution engine.

---

## Table of Contents

1. [Current State](#1-current-state)
2. [Target Architecture](#2-target-architecture)
3. [Feature Matrix](#3-feature-matrix)
4. [Schema & Port Strategy](#4-schema--port-strategy)
5. [DB Integration: Merkle Store + Graph Module](#5-db-integration-merkle-store--graph-module)
6. [UI Component Architecture](#6-ui-component-architecture)
7. [State Management](#7-state-management)
8. [Execution Model](#8-execution-model)
9. [Implementation Phases](#9-implementation-phases)
10. [Open Questions](#10-open-questions)

---

## 1. Current State

### What exists today (PR #53, merged)

- **FlowsPanel.tsx**: React Flow (`@xyflow/react`) canvas with:
  - Custom `FunctionNode` component (name, description, scope badge, secrets/configs count)
  - Drag-and-drop from sidebar palette
  - Animated Bezier edges between generic `payload` → `result` ports
  - localStorage persistence keyed by `'constructive-flows'`
  - Minimap, flow selector sidebar
- **FunctionsPanel.tsx**: Inline "Trigger" button with raw JSON payload editor
- **No subnets, no selections, no hotkeys, no context/cwd, no boundary nodes**

### What exists in @fbp/graph-editor

SVG-based editor with full Houdini-inspired graph editing (see [Feature Matrix](#3-feature-matrix)).

### What exists in constructive-db

`merkle_store_module` + `graph_module` generators producing tables + 20+ SQL functions for content-addressed graph storage and wave-based execution.

---

## 2. Target Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │ @fbp/graph-editor (SVG Canvas)                    │  │
│  │  ├─ GraphCanvas (pan/zoom, box select, connect)   │  │
│  │  ├─ GraphNode (ports, drag, multi-select)         │  │
│  │  ├─ GraphEdge (Bezier, selection)                 │  │
│  │  ├─ Toolbar (palette, hotkeys)                    │  │
│  │  ├─ PropertiesPanel (props, evaluate, rename)     │  │
│  │  └─ StatusBar (counts, breadcrumb, cwd)           │  │
│  └───────────────┬───────────────────────────────────┘  │
│                  │ onChange(graph: Graph)                │
│  ┌───────────────▼───────────────────────────────────┐  │
│  │ GraphBridge (adapter layer)                       │  │
│  │  ├─ Syncs @fbp/types Graph ↔ REST API             │
│  │  ├─ Maps NodeDefinitions from /api/functions      │  │
│  │  └─ Debounced save via API                        │  │
│  └───────────────┬───────────────────────────────────┘  │
└──────────────────┼──────────────────────────────────────┘
                   │ HTTP/JSON
┌──────────────────▼──────────────────────────────────────┐
│  Express Server (www/server/index.ts)                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Graph API Routes                                  │  │
│  │  POST /api/graphs          → create_function_graph│  │
│  │  GET  /api/graphs/:id      → serialize_graph      │  │
│  │  PUT  /api/graphs/:id      → import_graph_json    │  │
│  │  POST /api/graphs/:id/exec → start_execution      │  │
│  │  GET  /api/graphs/:id/exec → list executions      │  │
│  │  GET  /api/definitions     → import_definitions   │  │
│  └───────────────┬───────────────────────────────────┘  │
└──────────────────┼──────────────────────────────────────┘
                   │ SQL
┌──────────────────▼──────────────────────────────────────┐
│  PostgreSQL (provisioned by make up)                    │
│  ┌────────────────────┐  ┌────────────────────────────┐ │
│  │ merkle_store_module│  │ graph_module               │ │
│  │  object, store,    │  │  function_graphs,          │ │
│  │  commit, ref       │  │  function_graph_executions,│ │
│  │                    │  │  function_graph_exec_outputs│ │
│  └────────────────────┘  └────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │ platform_function_definitions (existing)           │ │
│  │ app_jobs.jobs (existing)                           │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Key decision: adopt `@fbp/graph-editor` as a dependency, don't rewrite it.**

The editor already implements the full feature set (subnets, collapse, selections, hotkeys, context). The constructive-functions UI wraps it with a bridge that:
1. Loads `NodeDefinition[]` from the platform function registry
2. Persists the `Graph` object to the DB via graph_module SQL functions
3. Triggers execution via `start_execution`

---

## 3. Feature Matrix

### Canvas & Navigation

| Feature | @fbp/graph-editor | Current FlowsPanel | Plan |
|---------|-------------------|---------------------|------|
| SVG canvas with dot grid | Yes | No (React Flow) | Adopt editor |
| Pan: Alt+Drag / Middle Mouse / Space+Drag | Yes | React Flow default | Adopt editor |
| Zoom: Ctrl/Cmd+Scroll | Yes | React Flow default | Adopt editor |
| Per-scope state (view + selection per cwd) | Yes (`stateByPath: Map`) | No | Adopt editor |
| Breadcrumb navigation (cwd path) | Yes (StatusBar) | No | Adopt editor |

### Selection System

| Feature | @fbp/graph-editor | Current FlowsPanel | Plan |
|---------|-------------------|---------------------|------|
| Click to select node | Yes | Yes (React Flow) | Adopt editor |
| Shift+Click add/remove selection | Yes | Partial | Adopt editor |
| Shift+Drag box select (marquee) | Yes | No | Adopt editor |
| Space+Drag to move marquee | Yes (`MOVE_BOX_SELECT`) | No | Adopt editor |
| Cmd/Ctrl+A select all | Yes | No | Adopt editor |
| Escape clear selection | Yes | No | Adopt editor |
| Edge selection (click) | Yes (`selectEdges`) | No | Adopt editor |
| Multi-node drag | Yes | Yes (React Flow) | Adopt editor |

### Node & Edge Operations

| Feature | @fbp/graph-editor | Current FlowsPanel | Plan |
|---------|-------------------|---------------------|------|
| Delete selected (Del/Backspace) | Yes | No | Adopt editor |
| Duplicate selection (Cmd/Ctrl+D) | Yes | No | Adopt editor |
| Copy selection (Cmd/Ctrl+C) | Yes | No | Adopt editor |
| Paste (Cmd/Ctrl+V) | Yes | No | Adopt editor |
| Rename node (inline edit) | Yes (`RENAME_NODE`) | No | Adopt editor |
| Drag from port to connect | Yes | Yes (React Flow) | Adopt editor |
| Temp edge line while connecting | Yes (`TempEdge`) | Yes | Adopt editor |
| Port type validation on connect | No (any→any) | No | Phase 2 |
| Auto-layout selection (L key) | Yes (`LAYOUT_SELECTION`) | No | Adopt editor |

### Subnets

| Feature | @fbp/graph-editor | Current FlowsPanel | Plan |
|---------|-------------------|---------------------|------|
| Dive into subnet (Enter) | Yes (`DIVE_INTO`) | No | Adopt editor |
| Go up from subnet (U) | Yes (`GO_UP`) | No | Adopt editor |
| Collapse selection to subnet (Shift+C) | Yes (`COLLAPSE_SELECTION`) | No | Adopt editor |
| Boundary nodes: graphInput | Yes | No | Adopt editor |
| Boundary nodes: graphOutput | Yes | No | Adopt editor |
| Boundary nodes: graphProp | Yes | No | Adopt editor |
| Derive ports from boundary nodes | Yes (`deriveBoundaryPorts`) | No | Adopt editor |
| Subnet node renders child ports | Yes (`GraphNode`) | No | Adopt editor |

### Properties & Evaluation

| Feature | @fbp/graph-editor | Current FlowsPanel | Plan |
|---------|-------------------|---------------------|------|
| Properties panel (auto-generated) | Yes | No | Adopt editor |
| Inline evaluate button | Yes (calls `evaluateFn`) | No | Phase 2 |
| Code editor for string props | Yes (`CodeEditor`) | No | Adopt editor |
| Channel reference detection | Yes (`ch("...")`, `$VAR`) | No | Phase 2 |

### Palette & Toolbar

| Feature | @fbp/graph-editor | Current FlowsPanel | Plan |
|---------|-------------------|---------------------|------|
| Node palette (grouped by category) | Yes | Yes (sidebar) | Adopt editor |
| Drag from palette to canvas | Yes (dataTransfer) | Yes | Adopt editor |
| Click to add from palette | Yes | No | Adopt editor |
| Boundary node palette items | Yes (graph/input, output, prop) | No | Adopt editor |
| Keyboard shortcut help panel | Yes (collapsible) | No | Adopt editor |

### Complete Hotkey Map

| Key | Action | Reducer Action |
|-----|--------|----------------|
| `Delete` / `Backspace` | Delete selected nodes/edges | `DELETE_NODES` + `DELETE_EDGES` |
| `Cmd/Ctrl+D` | Duplicate selection | `DUPLICATE_SELECTION` |
| `Cmd/Ctrl+C` | Copy selection | `COPY_SELECTION` |
| `Cmd/Ctrl+V` | Paste clipboard | `PASTE_SELECTION` |
| `Cmd/Ctrl+A` | Select all | `SELECT_ALL` |
| `Escape` | Clear selection / cancel connect | `CLEAR_SELECTION` / `CANCEL_CONNECTING` |
| `Enter` | Dive into selected subnet | `DIVE_INTO` |
| `U` | Go up from subnet | `GO_UP` |
| `Shift+C` | Collapse selection to subnet | `COLLAPSE_SELECTION` |
| `L` | Auto-layout selection | `LAYOUT_SELECTION` |
| `Shift+Drag` | Box select (marquee) | `START/UPDATE/END_BOX_SELECT` |
| `Space+Drag` | Move marquee while selecting | `MOVE_BOX_SELECT` |
| `Alt+Drag` / `Middle Mouse` | Pan canvas | `SET_VIEW` |
| `Space+Click+Drag` | Pan canvas | `SET_VIEW` |
| `Ctrl/Cmd+Scroll` | Zoom | `SET_VIEW` |

---

## 4. Schema & Port Strategy

### Current: Generic Ports

Every function has implicit ports:
```
input:  [{ name: "payload", type: "json" }]
output: [{ name: "result",  type: "json" }]
```

### Proposed: Typed Ports via handler.json Extension

Extend `handler.json` with explicit port definitions:

```json
{
  "name": "send-email",
  "version": "1.0.0",
  "type": "node-graphql",
  "inputs": [
    { "name": "to",      "type": "string", "schema": { "format": "email" } },
    { "name": "subject",  "type": "string" },
    { "name": "html",     "type": "string" },
    { "name": "from",     "type": "string", "schema": { "format": "email" }, "default": "noreply@example.com" }
  ],
  "outputs": [
    { "name": "result",   "type": "json",   "schema": { "properties": { "complete": { "type": "boolean" } } } }
  ]
}
```

### Port ↔ @fbp/types Mapping

```typescript
// handler.json port → @fbp/types PortDef
interface PortDef {
  name: string;
  type?: string;        // "string", "number", "json", "boolean"
  schema?: Record<string, any>;  // JSON Schema for validation
  multi?: boolean;      // accept multiple incoming edges
  description?: string;
}

// handler.json → NodeDefinition
function handlerToDefinition(handler: HandlerJson): NodeDefinition {
  return {
    context: 'function',                         // runtime context
    name: handler.name,                           // "send-email"
    category: handler.scope || 'platform',        // grouping
    inputs: handler.inputs || [{ name: 'payload', type: 'json' }],
    outputs: handler.outputs || [{ name: 'result', type: 'json' }],
    props: [
      ...handler.required_secrets?.map(s => ({ name: s.name, type: 'secret' })) || [],
      ...handler.required_configs?.map(c => ({ name: c.name, type: 'config' })) || []
    ]
  };
}
```

### Migration Path

1. Functions without `inputs`/`outputs` in handler.json keep the generic `payload`/`result` ports
2. Functions with explicit ports get per-field port rendering in the editor
3. Port `schema` fields enable edge-level type validation (Phase 2)
4. The `platform_function_definitions` table gets a new `port_schema jsonb` column (or the port data stays in handler.json and is served via the API)

### Trigger UI Impact

With typed ports, the Trigger form renders typed fields instead of a raw JSON textarea:

```
┌─────────────────────────────┐
│ Trigger: send-email         │
│                             │
│ to:      [email input    ]  │
│ subject: [text input     ]  │
│ html:    [multiline      ]  │
│ from:    [noreply@...    ]  │
│                             │
│ [Execute]                   │
└─────────────────────────────┘
```

---

## 5. DB Integration: Merkle Store + Graph Module

### 5a. Provisioning

The `graph_module` generator in constructive-db needs to be invoked during the constructive-functions database provisioning (`make up`). This produces:

**Tables:**

| Table | Schema | Purpose |
|-------|--------|---------|
| `{prefix}object` | merkle | Content-addressed tree nodes (`id` = UUID v5 hash of `kids[] + data`) |
| `{prefix}store` | merkle | Named stores (one per graph repo) |
| `{prefix}commit` | merkle | Commit history (store → tree snapshot) |
| `{prefix}ref` | merkle | Branch heads (mutable pointers) |
| `function_graphs` | public | Graph registry (name, store_id FK, context, is_valid, validation_errors) |
| `function_graph_executions` | private | Execution state (graph_id, status, input/output_payload, execution_plan, current_wave) |
| `function_graph_execution_outputs` | private | Content-addressed execution output storage |

### 5b. SQL Function → API Endpoint Mapping

| SQL Function | Visibility | API Endpoint | Purpose |
|--------------|------------|-------------|---------|
| `create_function_graph(scope_id, name, context, description)` | public | `POST /api/graphs` | Create empty graph with merkle store |
| `import_graph_json(scope_id, name, graph_json, context)` | public | `PUT /api/graphs/:id` | Import full @fbp/spec JSON into merkle tree |
| `serialize_graph(graph_id)` → jsonb | private | `GET /api/graphs/:id` | Read graph as @fbp/spec JSON |
| `add_node(scope_id, root_hash, node_name, node_type, context, graph_name, props, meta)` | public | _plumbing_ | Add single node to merkle tree |
| `add_edge(scope_id, root_hash, src_node, src_port, dst_node, dst_port, context, graph_name)` | public | _plumbing_ | Add single edge to merkle tree |
| `add_node_and_save(graph_id, ...)` | public | _porcelain_ | Add node + commit |
| `add_edge_and_save(graph_id, ...)` | public | _porcelain_ | Add edge + commit |
| `save_graph(graph_id, root_hash, message)` | public | `POST /api/graphs/:id/save` | Commit current state |
| `validate_function_graph(graph_id)` | public | `POST /api/graphs/:id/validate` | Structural validation |
| `read_function_graph(graph_id)` | public | _internal_ | Read graph row |
| `copy_graph(scope_id, graph_id, name)` | public | `POST /api/graphs/:id/copy` | Deep copy via serialize+deserialize |
| `start_execution(graph_id, input_payload, output_node, output_port, ...)` | public | `POST /api/graphs/:id/exec` | Begin execution |
| `tick_execution(execution_id)` | private | _internal_ | Advance execution wave |
| `complete_node(execution_id, node_name, output_data)` | private | `POST /api/exec/:id/complete` | Mark node done, trigger tick |
| `import_definitions(graph_id, source_scope_id, source_commit_id, contexts[])` | public | `POST /api/graphs/:id/definitions` | Pin NodeDefinitions |

### 5c. Graph JSON Round-Trip

The graph_module's `import_graph_json` / `serialize_graph` use the exact same JSON shape as `@fbp/types.Graph`:

```typescript
// Client saves:
const graph: Graph = editor.getGraph();
await fetch(`/api/graphs/${graphId}`, {
  method: 'PUT',
  body: JSON.stringify(graph)  // → import_graph_json
});

// Client loads:
const res = await fetch(`/api/graphs/${graphId}`);
const graph: Graph = await res.json();  // ← serialize_graph
editor.setGraph(graph);
```

No transformation needed — the @fbp/spec JSON format IS the storage format.

### 5d. NodeDefinition Sync

Platform functions → NodeDefinitions flow:

```
platform_function_definitions (existing table)
       │
       │ GET /api/functions (existing endpoint)
       ▼
handlerToDefinition() transform (in browser or server)
       │
       │ Becomes NodeDefinition[] for editor
       ▼
@fbp/graph-editor receives definitions prop
       │
       │ Also pinned to graph via import_definitions
       ▼
function_graphs.definitions_commit_id (merkle snapshot)
```

This means definitions are:
1. **Live** in the editor (loaded from API each session)
2. **Pinned** on each graph (via `definitions_commit_id`) for deterministic execution

---

## 6. UI Component Architecture

### Strategy: Wrap @fbp/graph-editor, Don't Rewrite

The `@fbp/graph-editor` package exports a `<GraphEditor>` component:

```tsx
<GraphEditor
  graph={graph}
  onChange={handleGraphChange}
  definitions={definitions}
  readOnly={false}
/>
```

Internally it composes:
- `GraphCanvas` — SVG canvas, pan/zoom, box select, connection, drag-and-drop
- `GraphNode` — Node rendering, ports, multi-select drag
- `GraphEdge` / `TempEdge` — Bezier edges
- `Toolbar` — Palette + hotkey help
- `PropertiesPanel` — Props editing, evaluate, rename
- `StatusBar` — Node/edge counts, cwd breadcrumb, zoom %
- `GraphContext` — Reducer with 30+ actions

### What to Build in constructive-functions

```
www/src/components/
  FlowsPanel.tsx          # REPLACE current React Flow implementation
    ├─ <GraphEditor>      # @fbp/graph-editor (adopted as dependency)
    ├─ FlowSelector       # List/create/delete graphs (backed by API)
    ├─ ExecutionPanel      # Run flow, show execution status/results
    └─ DefinitionLoader    # Fetch platform functions → NodeDefinition[]
```

**FlowsPanel.tsx** becomes a thin wrapper:

```tsx
function FlowsPanel() {
  const [graph, setGraph] = useState<Graph>(emptyGraph);
  const [definitions, setDefinitions] = useState<NodeDefinition[]>([]);
  const [graphId, setGraphId] = useState<string | null>(null);

  // Load definitions from platform functions
  useEffect(() => {
    api.getFunctions().then(fns => setDefinitions(fns.map(handlerToDefinition)));
  }, []);

  // Load graph from DB
  useEffect(() => {
    if (graphId) api.getGraph(graphId).then(setGraph);
  }, [graphId]);

  // Save graph to DB (debounced)
  const handleChange = useDebouncedCallback((g: Graph) => {
    if (graphId) api.saveGraph(graphId, g);
    setGraph(g);
  }, 1000);

  return (
    <div className="flex h-full">
      <FlowSelector onSelect={setGraphId} />
      <GraphEditor
        graph={graph}
        onChange={handleChange}
        definitions={definitions}
      />
      <ExecutionPanel graphId={graphId} />
    </div>
  );
}
```

### Theming

The editor uses Tailwind classes (`slate-*` color scheme). constructive-functions uses `zinc-950` dark theme. Options:

1. **Configure Tailwind content paths** to include `@fbp/graph-editor`:
   ```js
   content: ['./node_modules/@fbp/graph-editor/**/*.{js,tsx}']
   ```
2. **CSS custom properties** for colors if the editor supports theming
3. **Acceptable delta** — slate vs zinc are close enough in dark mode; can unify later

---

## 7. State Management

### Current: localStorage

```typescript
localStorage.setItem('constructive-flows', JSON.stringify(flows));
```

### Target: DB-Backed via Graph API

```
┌────────────┐     onChange      ┌─────────────┐     PUT /api/graphs/:id     ┌──────────────┐
│ GraphEditor ├────────────────▶│ GraphBridge  ├──────────────────────────▶│ import_graph_ │
│  (in-memory │                 │ (debounce    │                            │ json (merkle) │
│   reducer)  │◀────────────────┤  + optimistic│◀──────────────────────────┤              │
│             │   setGraph       │  updates)    │     GET /api/graphs/:id    │              │
└────────────┘                  └─────────────┘                            └──────────────┘
```

**GraphBridge responsibilities:**
- On mount: `GET /api/graphs/:id` → `serialize_graph` → pass to editor
- On change: debounced `PUT /api/graphs/:id` → `import_graph_json` (full snapshot)
- Optimistic updates: editor state is always ahead of DB, reconcile on error
- No offline fallback needed (server is local via `make up`)

### Per-Scope State (cwd)

The editor's `stateByPath: Map<string, ScopeState>` already handles per-scope view/selection state internally. This is ephemeral (session-only) — not persisted to DB. The graph _data_ (nodes, edges) is persisted; the view state (pan, zoom, selection) is not.

This matches the Houdini model: the file (graph) is saved, but your viewport is session-local.

---

## 8. Execution Model

### Overview: Wave-Based Scheduling

The `graph_module` implements a wave-based execution engine:

```
start_execution(graph_id, input_payload)
  │
  │ 1. Build execution_plan from graph topology
  │ 2. Identify wave-0 nodes (no dependencies, or boundary inputs)
  │ 3. Call tick_execution
  │
  ▼
tick_execution(execution_id)            ◀──┐
  │                                        │
  │ For each ready node in current wave:   │
  │   • Collect input data from upstream   │
  │   • Dispatch job to app_jobs.jobs      │
  │                                        │
  ▼                                        │
Job Worker picks up job                    │
  │                                        │
  │ Function handler runs                  │
  │                                        │
  ▼                                        │
complete_node(execution_id, node_name, output_data)
  │                                        │
  │ 1. Store output in execution_outputs   │
  │ 2. Check if downstream nodes ready     │
  │ 3. If yes → tick_execution ────────────┘
  │ 4. If all done → mark execution complete
  │
  ▼
Execution status: 'completed' | 'failed' | 'timed_out'
```

### Execution Parameters

```sql
start_execution(
  graph_id        uuid,
  input_payload   jsonb DEFAULT '{}'::jsonb,   -- feeds graphInput boundary nodes
  output_node     text  DEFAULT 'output_result',
  output_port     text  DEFAULT 'value',
  max_ticks       int   DEFAULT 100,           -- safety limit
  max_pending_jobs int  DEFAULT 50,            -- concurrency cap
  timeout_interval interval DEFAULT '5 minutes',
  parent_execution_id uuid DEFAULT NULL,       -- for subnet execution chaining
  parent_node_name text DEFAULT NULL
);
```

### Subnet Execution

When `tick_execution` encounters a subnet node:
1. It calls `start_execution` recursively with `parent_execution_id` + `parent_node_name`
2. The child execution runs independently
3. When the child completes, `complete_node` is called on the parent execution
4. The parent then proceeds to the next wave

### UI Integration

```
┌──────────────────────────────────────┐
│ Execution Panel                      │
│                                      │
│ Graph: "email-pipeline"              │
│ Status: ● running (wave 2/4)         │
│                                      │
│ Nodes:                               │
│   ✓ fetch-template    [completed]    │
│   ✓ format-html       [completed]    │
│   ● send-email        [running]      │
│   ○ log-result        [pending]      │
│                                      │
│ Input:  { to: "...", template: "..." }│
│ Output: (pending)                    │
│                                      │
│ [Execute] [Cancel]                   │
└──────────────────────────────────────┘
```

The execution panel polls `GET /api/graphs/:id/exec/:execId` for status updates, visualizing which nodes have completed, which are running, and which are pending.

---

## 9. Implementation Phases

### Phase 1: Editor Adoption + DB Wiring

**Goal:** Replace React Flow FlowsPanel with @fbp/graph-editor, persist to DB.

**Tasks:**
1. Add `@fbp/graph-editor`, `@fbp/types`, `@fbp/spec` as www/ dependencies
2. Provision `merkle_store_module` + `graph_module` in constructive-functions DB blueprint
3. Add Express API routes: `POST/GET/PUT /api/graphs`, `GET /api/graphs/:id`
4. Build `DefinitionLoader`: `GET /api/functions` → `NodeDefinition[]` via `handlerToDefinition()`
5. Replace `FlowsPanel.tsx` with `<GraphEditor>` wrapper + `FlowSelector` + `GraphBridge`
6. Configure Tailwind to include editor styles
7. Remove `@xyflow/react` dependency

**Delivers:** Full editor with subnets, collapse (Shift+C), selections, hotkeys, context/cwd, boundary nodes, palette, properties panel — all persisted to merkle store.

### Phase 2: Typed Ports + Execution

**Goal:** Per-field ports on functions, flow execution.

**Tasks:**
1. Extend `handler.json` schema with `inputs[]` / `outputs[]`
2. Update `handlerToDefinition()` to map typed ports
3. Add port compatibility validation on edge creation (schema-based)
4. Add Express routes: `POST /api/graphs/:id/exec`, `GET /api/graphs/:id/exec/:execId`
5. Build `ExecutionPanel` component (status, node progress, input/output display)
6. Wire "Run Flow" button → `start_execution` SQL function
7. Update Trigger UI to render typed fields from port schemas
8. Implement `complete_node` webhook endpoint for job worker callback

**Delivers:** Typed port rendering, schema validation on edges, full flow execution with visual progress.

### Phase 3: Advanced Features

**Goal:** Channel references, multi-tab processes, graph versioning.

**Tasks:**
1. Enable channel reference detection (`ch("...")`, `$VAR`) in property values
2. Implement multi-process/multi-tab support (`EditorState.processes: Map<string, ViewProcess>`)
3. Add graph version history UI (merkle commit log)
4. Add graph diff view (compare two commits)
5. Implement `import_definitions` for pinning definition snapshots
6. Add `evaluateFn` integration for in-editor preview (lazy evaluation via `@fbp/evaluator`)

---

## 10. Open Questions

### Q1: Graph Module Provisioning
How is the `graph_module` generator invoked during `make up`? Does the constructive-functions infra schema already have a hook for registering new modules, or do we need to add a migration?

### Q2: Definition Storage Strategy
Should typed port definitions live in:
- (a) `handler.json` only (served by API, not stored in DB)
- (b) New `port_schema jsonb` column on `platform_function_definitions`
- (c) Both (handler.json is source of truth, synced to DB on registration)

Option (c) seems most robust — handler.json is the authoring format, DB is the runtime source.

### Q3: @fbp/graph-editor Package Distribution
Is `@fbp/graph-editor` published to an npm registry, or should constructive-functions reference it as a workspace/git dependency? This affects the dependency declaration in `www/package.json`.

### Q4: Authentication for Graph API
The Express server currently uses database-scoped JWT claims. Graph API routes need the same auth pattern — should they use the existing `jwt.claims.database_id` mechanism?

### Q5: Execution Job Dispatch
When `tick_execution` dispatches jobs, it presumably inserts into `app_jobs.jobs`. How does the job worker know to call `complete_node` when the function handler returns? Options:
- (a) Job worker calls `complete_node` SQL function directly after handler returns
- (b) Function handler POSTs to a callback URL
- (c) Job service polls execution status

### Q6: Offline / Disconnected Editing
Should the editor support offline editing with sync-on-reconnect? The merkle store's content-addressed design enables this (merge by hash), but it adds complexity. Recommend deferring to Phase 3+.
