# Unified Compute Worker: Flows + Functions

## Executive Summary

One compute-worker, one function contract. Every function is usable standalone or as a graph node — there is no special prefix, no separate dispatch path. The function contract is:

```
(params: JSON, context: FunctionContext) → JSON
```

- **`params`** = input port values (keys are port names, assembled by graph engine or provided directly)
- **return value** = output port values (keys are port names, consumed by downstream edges or returned to caller)
- **`context`** = extensible resource bindings (GraphQL clients, storage, API access, job metadata)

The graph engine (SQL in constructive-db) handles topology, scheduling, and data routing. The compute-worker handles dispatch and resource provisioning. The function handles business logic.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  PostgreSQL (constructive-db)                         │
│  ┌────────────────────────────────────────────────┐  │
│  │ start_execution(graph_id, inputs)               │  │
│  │   → seed graphInput boundary nodes              │  │
│  │   → tick_execution()                            │  │
│  │                                                  │  │
│  │ tick_execution(execution_id)                     │  │
│  │   → walk nodes, collect inputs from edges        │  │
│  │   → skip graphInput/graphProp (already resolved) │  │
│  │   → graphOutput → store output, maybe complete   │  │
│  │   → definition node → spawn sub-execution        │  │
│  │   → leaf node → INSERT INTO app_jobs.jobs        │  │
│  │       task_identifier = node_type (raw!)          │  │
│  │       payload = { execution_id, node_name,        │  │
│  │                   node_type, inputs }             │  │
│  │                                                  │  │
│  │ complete_node(execution_id, node_name, outputs)  │  │
│  │   → store outputs in execution_outputs           │  │
│  │   → tick_execution() again (cascade)             │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
              ↕ app_jobs.jobs
┌──────────────────────────────────────────────────────┐
│  Compute Worker (Node.js)                             │
│                                                       │
│  doWork(job):                                         │
│    1. Set GUCs (jwt.claims.*)                         │
│    2. Check billing quota                             │
│    3. Resolve function → service_url                  │
│    4. Create invocation record                        │
│    5. HTTP POST to function (params = job.inputs      │
│       or job.payload)                                 │
│    6. Record invocation result                        │
│    7. Log to compute_log                              │
│    8. IF job has execution_id + node_name:            │
│       → call complete_node(execution_id, node_name,   │
│         response_body)                                │
│       → this triggers tick_execution → may enqueue    │
│         more jobs → worker picks them up next loop    │
└──────────────────────────────────────────────────────┘
              ↕ HTTP POST
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Node.js fn   │  │ Python fn    │  │ Node.js fn   │
│ (Express)    │  │ (FastAPI)    │  │ (Express)    │
│              │  │              │  │              │
│ handler(     │  │ handler(     │  │ handler(     │
│   params,    │  │   payload    │  │   params,    │
│   context    │  │ ) → dict     │  │   context    │
│ ) → object   │  │              │  │ ) → object   │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## The Function Contract

### handler.json (Enhanced)

```json
{
  "name": "send-email",
  "version": "1.6.4",
  "type": "node-graphql",
  "port": 8081,
  "taskIdentifier": "send-email",
  "scope": "platform",
  "description": "Sends transactional emails via Mailgun or SMTP",

  "inputs": [
    { "name": "to", "type": "string", "description": "Recipient email" },
    { "name": "subject", "type": "string", "description": "Subject line" },
    { "name": "html", "type": "string", "description": "HTML body" }
  ],
  "outputs": [
    { "name": "messageId", "type": "string", "description": "Sent message ID" },
    { "name": "status", "type": "string", "description": "Send status" }
  ],

  "requiredSecrets": [...],
  "requiredConfigs": [...],

  "resources": {
    "storage": { "bucket": "email-templates", "access": "read" },
    "api": {
      "tenant": { "type": "graphql", "scope": "tenant" },
      "meta": { "type": "graphql", "scope": "meta" }
    }
  }
}
```

New fields:
- **`inputs`** / **`outputs`** — typed port definitions, aligned with `@fbp/types.Port`
- **`resources`** — declarative resource bindings the compute-worker provisions before dispatch

### Port Mapping

| @fbp/types Port | handler.json | Runtime |
|---|---|---|
| `{ name: 'to', type: 'string' }` | `inputs[].name` | Key in `params` object |
| `{ name: 'status', type: 'string' }` | `outputs[].name` | Key in return value |

When a function is used as a graph node, the graph engine assembles `params` from upstream edges using port names. When called standalone, `params` is the raw job payload.

### Backwards Compatibility

If `inputs`/`outputs` are omitted, the function uses the legacy implicit port model:
- One input port: `payload` (type: `json`)
- One output port: `result` (type: `json`)

This matches the existing `fbp-integration.md` spec and requires zero changes to existing functions.

---

## Extensible Context

### Current

```typescript
type FunctionContext = {
  job: { jobId, workerId, databaseId, actorId, entityId };
  client: GraphQLClient;   // tenant-scoped
  meta: GraphQLClient;     // meta-scoped
  log: FunctionLogger;
  env: Record<string, string | undefined>;
};
```

### Proposed

```typescript
type FunctionContext = {
  // Existing — unchanged
  job: {
    jobId?: string;
    workerId?: string;
    databaseId?: string;
    actorId?: string;
    entityId?: string;
    // NEW: graph context (present when running as graph node)
    executionId?: string;
    nodeName?: string;
  };
  client: GraphQLClient;
  meta: GraphQLClient;
  log: FunctionLogger;
  env: Record<string, string | undefined>;

  // NEW — resource bindings (provisioned by compute-worker from handler.json)
  storage?: StorageClient;
  api?: Record<string, ApiClient>;

  // FUTURE — compute resources
  // gpu?: GpuHandle;
  // inference?: InferenceClient;
};
```

### How Resources Are Provisioned

1. Function declares `resources` in `handler.json`
2. `handler.json` is registered in `platform_function_definitions` (the `resources` field stored as JSONB)
3. Before HTTP dispatch, compute-worker reads the function's resource declarations
4. Worker provisions resource clients with the job's context (databaseId, actorId, etc.)
5. Resource handles are passed via HTTP headers (URLs, tokens) that the runtime constructs into clients

```
Compute Worker                          Function Runtime (Node.js/Python)
─────────────────                       ──────────────────────────────────
read resources from definition          
provision storage client (scoped)       
provision API clients (scoped)          
                                        
HTTP POST to function                   
  Headers:                              
    X-Database-Id: ...                  → context.job.databaseId
    X-Actor-Id: ...                     → context.job.actorId
    X-Storage-Url: ...                  → context.storage = new StorageClient(url)
    X-Api-Tenant-Url: ...              → context.api.tenant = new ApiClient(url)
    X-Execution-Id: ...                → context.job.executionId
    X-Node-Name: ...                   → context.job.nodeName
  Body: { to, subject, html }          → params
                                        
                                        handler(params, context) → result
```

### Python Runtime

The Python FastAPI template extracts headers into a context dict:

```python
@app.post("/")
async def handle(request: Request):
    payload = await request.json()
    context = {
        "job": {
            "job_id": request.headers.get("X-Job-Id"),
            "database_id": request.headers.get("X-Database-Id"),
            "execution_id": request.headers.get("X-Execution-Id"),
            "node_name": request.headers.get("X-Node-Name"),
        },
        "storage": StorageClient(request.headers.get("X-Storage-Url")),
        "log": logger,
    }
    result = await handler(payload, context)
    return JSONResponse(content=result)
```

---

## Removing the `fbp:eval:` Prefix

### Current (constructive-db tick_execution, line 181)

```sql
INSERT INTO app_jobs.jobs (database_id, task_identifier, payload)
VALUES (
  v_exec.database_id,
  ('fbp:eval:' || v_graph.context || ':') || v_node_type,  -- ← PREFIX
  json_build_object(
    'execution_id', v_exec.id,
    'node_name', v_node_name,
    'node_type', v_node_type,
    'inputs', v_inputs
  )::json
);
```

### Proposed

```sql
INSERT INTO app_jobs.jobs (database_id, task_identifier, payload)
VALUES (
  v_exec.database_id,
  v_node_type,  -- ← RAW node type = task_identifier in platform_function_definitions
  json_build_object(
    'execution_id', v_exec.id,
    'node_name', v_node_name,
    'node_type', v_node_type,
    'inputs', v_inputs
  )::json
);
```

### Also update pending job count (line 167)

```sql
-- Current: counts by prefix
WHERE task_identifier LIKE 'fbp:eval:%'
  AND (payload::jsonb->>'execution_id')::uuid = execution_id

-- Proposed: counts by execution_id in payload (no prefix needed)
WHERE (payload::jsonb->>'execution_id')::uuid = execution_id
```

### Compute Worker Detection

The worker no longer needs prefix matching. Instead:

```typescript
async doWork(job: ComputeJobRow): Promise<void> {
  const { task_identifier, payload } = job;
  
  // Resolve function — same path for standalone and graph nodes
  const fn = await this.discovery.resolve(task_identifier);
  
  // Determine what to send as params
  const isGraphNode = payload?.execution_id && payload?.node_name;
  const params = isGraphNode ? payload.inputs : payload;
  
  // Standard dispatch pipeline (GUC, billing, invocation, HTTP, compute_log)
  const response = await this.dispatch(fn, params, job);
  
  // If this was a graph node, complete it (triggers next tick)
  if (isGraphNode) {
    await this.pgPool.query(
      `SELECT constructive_compute_private.platform_complete_node($1, $2, $3::jsonb)`,
      [payload.execution_id, payload.node_name, JSON.stringify(response)]
    );
  }
}
```

---

## How It Maps to @fbp/types

### NodeDefinition ↔ platform_function_definition ↔ handler.json

```
@fbp/types.NodeDefinition          handler.json                     platform_function_definitions
────────────────────────           ────────────                     ─────────────────────────────
name: 'add'                        name: 'add'                      name: 'add'
context: 'js'                      type: 'node-graphql'             scope: 'platform'
category: 'math'                   scope: 'platform'                
inputs: [{ name: 'a' }]           inputs: [{ name: 'a' }]          (stored in JSONB column)
outputs: [{ name: 'sum' }]        outputs: [{ name: 'sum' }]       (stored in JSONB column)
props: [...]                       requiredSecrets/Configs           required_secrets/configs
description: 'Adds numbers'        description: 'Adds numbers'      description: 'Adds numbers'
impl: (inputs, props) => ...       — (runtime, not stored)          service_url: 'http://...'
graph: { ... }                     — (definition graphs stored in merkle store, not handler.json)
```

### @fbp/evaluator vs Compute Worker

| Feature | @fbp/evaluator | Compute Worker (unified) |
|---|---|---|
| Evaluation | In-process, synchronous lazy | Distributed, async tick-based |
| Node impl | `impl(inputs, props) → outputs` | `handler(params, context) → result` |
| Scheduling | Recursive DFS from output node | SQL `tick_execution` BFS from inputs |
| Caching | In-memory Map per evaluation | Content-addressed `execution_outputs` table |
| Subnets | Recursive `evaluate()` call | `start_execution()` with `parent_execution_id` |
| Definitions | `NodeDefinitionWithImpl.graph` | Merkle store lookup in `tick_execution` |
| Multi-output | Keys of return object | Keys of return object ← **same** |
| Props | Passed as second arg to `impl` | Via `requiredConfigs` / env vars |

The key alignment: **both use the same output convention** — the return value is an object where keys are output port names.

---

## Evaluation Strategy: Lazy (Tick-Based)

The existing SQL engine already implements lazy evaluation via tick-based polling:

1. `start_execution()` seeds `graphInput` boundary nodes as completed (their outputs are the graph's inputs)
2. `tick_execution()` scans all nodes, finds ones where all upstream edges have completed outputs
3. For each ready node:
   - `graphOutput` → store output, maybe complete execution
   - Definition with graph → spawn sub-execution
   - Leaf node → enqueue job (worker dispatches HTTP)
4. `complete_node()` stores the response, triggers `tick_execution()` again
5. Repeat until no more jobs are enqueued and the output node is computed

This is lazy because only nodes whose inputs are available get evaluated. Unreachable nodes are never touched.

### Safety Limits

| Limit | Default | Purpose |
|---|---|---|
| `max_ticks` | 100 | Prevents infinite loops |
| `max_pending_jobs` | 50 | Prevents job queue flooding |
| `timeout_at` | now() + 5 min | Wall-clock deadline |

---

## Test Environment Design

### What a Simple Test Flow Looks Like

```
Calculator: (5 + 3) * 2 = 16

        ┌───────────┐     ┌──────────────┐
{ a, b }│  add (js)  │────▶│ double (py)  │──▶ graphOutput
        │ a + b      │     │ value * 2    │
        └───────────┘     └──────────────┘
```

```json
{
  "name": "calculator",
  "context": "function",
  "nodes": [
    { "name": "input_a", "type": "graphInput", "props": [{ "name": "portName", "value": "a" }] },
    { "name": "input_b", "type": "graphInput", "props": [{ "name": "portName", "value": "b" }] },
    { "name": "adder",   "type": "add" },
    { "name": "doubler", "type": "double" },
    { "name": "output_result", "type": "graphOutput", "props": [{ "name": "portName", "value": "result" }] }
  ],
  "edges": [
    { "src": { "node": "input_a", "port": "value" }, "dst": { "node": "adder", "port": "a" } },
    { "src": { "node": "input_b", "port": "value" }, "dst": { "node": "adder", "port": "b" } },
    { "src": { "node": "adder",   "port": "sum" },   "dst": { "node": "doubler", "port": "value" } },
    { "src": { "node": "doubler", "port": "result" }, "dst": { "node": "output_result", "port": "value" } }
  ]
}
```

### Test Implementation

```typescript
// Two mock function servers (one "Node.js", one "Python" — both just Express in test)
const addServer = createMockFunctionServer();
addServer.setHandler((params) => ({ sum: params.a + params.b }));

const doubleServer = createMockFunctionServer();
doubleServer.setHandler((params) => ({ result: params.value * 2 }));

// Register in platform_function_definitions
await registerFunction('add', addServer.url);
await registerFunction('double', doubleServer.url);

// Import graph, start execution
const graphId = await importGraph(calculatorGraph);
const execId = await startExecution(graphId, { a: 5, b: 3 });

// Worker loop: process all graph jobs until completion
await worker.processUntilIdle();

// Assertions
const exec = await getExecution(execId);
expect(exec.status).toBe('completed');
expect(exec.output_payload.value).toBe(16);  // (5+3)*2

// Verify each function saw correct inputs
expect(addServer.lastRequest.body).toEqual({ a: 5, b: 3 });
expect(doubleServer.lastRequest.body).toEqual({ value: 8 });

// Verify full pipeline per node
expect(invocations).toHaveLength(2);
expect(computeLogs).toHaveLength(2);
```

---

## Research Findings (Consolidated from 3 Deep-Dive Sessions)

### 1. @fbp/* Packages (constructive-io/fbp)

**Function contract aligns perfectly.** Every `impl` is `(inputs, props) → outputs` — maps 1:1 to HTTP endpoint with no wrapper. The evaluator is lazy pull-based: traces backwards from the requested output node, only evaluating required upstream nodes.

**Definition lookup pattern:** `"${context}:${name}"` (e.g., `js:add`). The `context` field on `NodeDefinition` drives runtime selection (js/python). In our unified model, `context` can map to the template type (`node-graphql`, `python`) while `name` maps to `task_identifier`.

**Built-in definitions catalog:**

| Category | Definitions | Impl Pattern |
|---|---|---|
| `const` | `number`, `string`, `boolean`, `json` | Props → output `value` |
| `math` | `add`, `multiply` | Inputs `a,b` → output `sum`/`product` |
| `core` | `jsonSelect`, `jsonObject`, `flowGuard`, `stringTemplate`, `stringConcat` | Various transform patterns |
| `net` | `graphql/request` | HTTP fetch with `endpoint`/`document` props |

**Key types for integration:**
- `Port`: `{ name, type, schema?, description?, optional?, multi? }`
- `NodeDefinition`: `{ context, name, category?, inputs?, outputs?, props?, graph?, volatile?, description?, icon? }`
- `Edge`: `{ src: { node, port }, dst: { node, port }, channel? }`
- Boundary nodes: `graphInput` (collects inputs via `portName` prop), `graphOutput` (emits outputs), `graphProp` (static config)
- `volatile` flag on NodeDefinition = "re-evaluate every call, don't cache" (relevant for side-effecting functions like send-email)

**Gaps identified:**
- No error propagation model (evaluator throws on failure, but graph execution needs node-level error status)
- No retry/timeout config on nodes (the SQL engine has `max_ticks` and `timeout_at`, but nothing per-node)
- No auth context flowing through evaluation (our `context` parameter fills this gap)

### 2. constructive-db Graph Execution Engine

**`fbp:eval:` prefix removal requires exactly 4 changes:**
1. `tick_execution` line 181: job enqueue → change `'fbp:eval:' || context || ':' || node_type` to just `v_node_type`
2. `tick_execution` line 167: pending job count → drop `task_identifier LIKE 'fbp:eval:%'` filter, keep `(payload::jsonb->>'execution_id')::uuid = execution_id`
3. `graph-test-helper.ts` line 76: `MockGraphService.doWork()` prefix check → change to payload-based detection
4. `graph-test-helper.ts` line 380: `waitForJobs()` polling filter → use payload `execution_id` match

**Backwards-compatible:** The pending job count already filters on `execution_id` in payload, so removing the prefix filter just widens the query slightly (still scoped by execution_id). No existing jobs in queue would be affected since graph execution is not used in production yet.

**Graph data model (8 tables across 3 schemas):**
- `constructive_compute_public.platform_function_graphs` — graph metadata (context, name, store_id)
- `constructive_compute_private.platform_function_graph_executions` — execution state (status, node_outputs JSONB, tick_count, max_ticks, max_pending_jobs, timeout_at, output_node, parent_execution_id, parent_node_name)
- `constructive_compute_private.platform_function_graph_execution_outputs` — content-addressed output storage (hash dedup)
- 5 merkle store tables: `_ref`, `_commit`, `_tree`, `_object`, plus `get_all()`/`get_node_at_path()` functions

**Execution algorithm (tick_execution):**
1. Validate execution exists, is running, within tick/timeout limits
2. Load graph from merkle store via `get_all(database_id, tree_id)` — filters by path `[context, 'graphs', name, 'nodes'|'edges', ...]`
3. For each node: skip graphInput/graphProp (boundary), skip already-completed nodes
4. Check readiness: all incoming edges' source nodes must have outputs in `node_outputs` JSONB
5. Assemble inputs from upstream outputs using edge port mapping: `output_data->src_port` → `inputs[dst_port]`
6. Handle graphOutput: store assembled inputs as execution output, check completion
7. Handle definition nodes (embedded graphs): `platform_import_graph_json()` + `platform_start_execution()` with parent link
8. Handle leaf nodes: enqueue job in `app_jobs.jobs`

**complete_node algorithm:**
1. Content-address the output (sha256 hash), store in `execution_outputs` (dedup via ON CONFLICT)
2. Update `node_outputs` JSONB on the execution row
3. Call `tick_execution()` to cascade to newly-ready downstream nodes

**Test infrastructure (1279 lines, 11 fixtures):**
- `GraphTestHelper` — fluent API: `importGraph()`, `startExecution()`, `tick()`, `completeNode()`, `getExecution()`, `runToCompletion()`
- `MockGraphService` — in-process job handler that polls `app_jobs.jobs`, calls `complete_node()` directly (no HTTP)
- Fixtures: `SIMPLE_ADD_GRAPH`, `CHAIN_GRAPH`, `MULTI_OUTPUT_GRAPH`, `BRANCHING_GRAPH`, `SUBNET_GRAPH`, `NESTED_SUBNET_GRAPH`, `GRAPH_WITH_DEFINITIONS`, `DEEP_NESTED_DEFINITION_GRAPH`, `SAFETY_LIMIT_GRAPH`, `BOUNDARY_PASS_THROUGH_GRAPH`, `LARGE_FANOUT_GRAPH`

### 3. Compute Worker Architecture

**Current dispatch pipeline (from PR #91 branch):**
1. `ComputeWorker.doWork(job)` — entry point
2. `setJobGUCs(client, job)` — sets `jwt.claims.*` via `set_config()`
3. `BillingTracker.checkQuota()` — verifies billing allowance
4. `FunctionDiscovery.resolve(task_identifier)` → `{ name, service_url, ... }` from `platform_function_definitions`
5. `InvocationTracker.create()` — INSERT into `platform_function_invocations`
6. `compute_request(service_url, payload, headers)` — HTTP POST with `X-Database-Id`, `X-Actor-Id`, `X-Organization-Id`, `X-Worker-Id`, `X-Job-Id`
7. `InvocationTracker.complete()|.fail()` — UPDATE invocation status + duration
8. `ComputeLogTracker.log()` — INSERT into `platform_compute_log`
9. `BillingTracker.recordUsage()` — record metered consumption

**Integration points for graph dispatch:**
- Between step 6 and 7: detect `execution_id`/`node_name` in payload → call `complete_node()`
- Step 5 (HTTP): pass `payload.inputs` as body (not full payload) when `isGraphNode`
- Step 6 (headers): add `X-Execution-Id` and `X-Node-Name` to HTTP headers
- No changes needed to steps 1-4, 7-9 — GUCs, billing, invocation tracking, compute log all work as-is per-node

**FunctionContext (current in fn-types):**
```typescript
{ job: { jobId, workerId, databaseId, actorId, entityId },
  client: GraphQLClient, meta: GraphQLClient, log: FunctionLogger,
  env: Record<string, string | undefined> }
```

**handler.json current fields:** `name`, `version`, `type`, `port`, `taskIdentifier`, `scope`, `description`, `requiredSecrets[]`, `requiredConfigs[]`, `payloadSchema`, `dependencies`

---

## Implementation Phases

### Phase 1: Remove `fbp:eval:` prefix (constructive-db)

**Scope:** SQL migration + test updates in constructive-db  
**Changes:**
- [ ] `tick_execution` line 181: `v_node_type` instead of `'fbp:eval:' || context || ':' || node_type`
- [ ] `tick_execution` line 167: remove `task_identifier LIKE 'fbp:eval:%'` filter (keep execution_id match)
- [ ] `graph-test-helper.ts` line 76: update `doWork()` detection to payload-based
- [ ] `graph-test-helper.ts` line 380: update `waitForJobs()` filter
- [ ] Run existing graph-module integration tests — all 11 fixtures must pass

### Phase 2: Graph dispatch in compute-worker (constructive-functions)

**Scope:** ~30 lines in `job/compute-worker/src/index.ts`  
**Changes:**
- [ ] In `doWork()`: detect `isGraphNode` from `payload.execution_id && payload.node_name`
- [ ] When `isGraphNode`: send `payload.inputs` as HTTP body (not full payload)
- [ ] Add `X-Execution-Id` and `X-Node-Name` to HTTP headers
- [ ] After HTTP response + invocation tracking: call `complete_node(execution_id, node_name, response)`
- [ ] Add `executionId` and `nodeName` to `FunctionContext.job` type

### Phase 3: Integration tests (constructive-functions)

**Scope:** New tests in `packages/functions-test/`  
**Changes:**
- [ ] Graph test helpers: `importGraph()`, `startExecution()`, `getExecution()`, `registerFunction()`
- [ ] `createMockFunctionServer()` — tiny Express server that records requests and returns configured responses
- [ ] Calculator flow test: `graphInput(a,b) → add → double → graphOutput` with assertions on outputs, per-node invocation records, compute logs
- [ ] Failure propagation test: node failure → execution fails
- [ ] Safety limit test: max_ticks exceeded → execution fails
- [ ] Verify per-node billing metering

### Phase 4: handler.json `inputs`/`outputs` port definitions

**Scope:** handler.json schema extension + `toNodeDefinition()` mapper  
**Changes:**
- [ ] Add optional `inputs: Port[]` and `outputs: Port[]` to handler.json schema
- [ ] Update `scripts/generate.ts` to pass through port definitions
- [ ] Implement `toNodeDefinition()` that maps handler.json → `@fbp/types.NodeDefinition`
- [ ] Backwards-compatible: if omitted, defaults to `[{ name: 'payload', type: 'json' }]` / `[{ name: 'result', type: 'json' }]`
- [ ] Store ports in `platform_function_definitions` (new JSONB columns or extension of existing)

### Phase 5: Extensible context (`resources`) — FUTURE TODO

**Scope:** Resource binding via handler.json  
**Design direction (to be detailed later):**
- `resources` field in handler.json declares storage, API, GPU bindings
- Compute-worker provisions resources before dispatch, passes via headers
- Node.js and Python runtimes construct clients from headers
- Follows same pattern as existing `requiredSecrets`/`requiredConfigs`

### Phase 6: www Flow Panel integration

**Scope:** Wire graph editor to live execution  
**Changes:**
- [ ] "Execute Flow" button calls `start_execution()` via GraphQL
- [ ] Poll execution status, color nodes by state (pending/running/completed/failed)
- [ ] Display node outputs on hover/click
- [ ] Save/load flows to merkle store (already partially done in PR #90)

---

## Cross-Reference: Existing Implementations

| Component | Location | Status |
|---|---|---|
| tick_execution SQL | `constructive-db/application/constructive/deploy/schemas/constructive_compute_private/procedures/platform_tick_execution/procedure.sql` | Exists, needs prefix removal (lines 167, 181) |
| complete_node SQL | `constructive-db/application/constructive/deploy/schemas/constructive_compute_private/procedures/platform_complete_node/procedure.sql` | Exists, no changes needed |
| start_execution SQL | `constructive-db/application/constructive/deploy/schemas/constructive_compute_public/procedures/platform_start_execution/procedure.sql` | Exists, no changes needed |
| MockGraphService | `constructive-db/application/app/__tests__/helpers/graph-test-helper.ts` | Exists, needs prefix detection update (lines 76, 380) |
| Graph fixtures (11) | `constructive-db/application/app/__tests__/helpers/graph-fixtures.ts` | Exists, no changes needed |
| @fbp/types | `fbp/packages/types/src/types.ts` | Published, stable — Port, NodeDefinition, Edge, Graph |
| @fbp/evaluator | `fbp/packages/evaluator/src/evaluate.ts` | Published — lazy eval, boundary nodes, subnets, definitions |
| @fbp/spec | `fbp/packages/spec/` | Published — storage/manipulation API, path-based identity |
| @fbp/graph-editor | `fbp/packages/graph-editor/` | Published — SVG-based React component |
| Built-in definitions | `fbp/packages/evaluator/src/definitions/{math,core,net,ui}.ts` | 12 definitions across 4 categories |
| ComputeWorker | `constructive-functions/job/compute-worker/src/index.ts` | Exists (PR #91), needs graph dispatch (~30 lines) |
| FunctionContext | `constructive-functions/packages/fn-types/src/runtime.ts` | Exists, needs `executionId`/`nodeName` in job + future resource bindings |
| FBP integration spec | `constructive-functions/docs/spec/fbp-integration.md` | Exists, needs update for typed ports |
| FBP skill | `constructive-functions/.agents/skills/fbp/SKILL.md` | Exists, needs update for unified model |
| Functions-test | `constructive-functions/packages/functions-test/` | Phase 1-3 done (PR #92, 30 tests) |

---

## Research Sessions

| Session | Scope | Key Output |
|---|---|---|
| [FBP packages](https://app.devin.ai/sessions/e901662b55ce4b0fba9289265193697a) | @fbp/types, evaluator, spec, graph-editor | Type system alignment, built-in definitions catalog, gaps (error propagation, retry, auth) |
| [Graph engine](https://app.devin.ai/sessions/ae06acaef5a245f399865358d8510f10) | tick_execution, complete_node, start_execution, merkle store, test infra | 4 exact change locations for prefix removal, 8-table data model, 11 test fixtures |
| [Compute worker](https://app.devin.ai/sessions/fc0e6ee4420a4c5d9675ca305a58aa6a) | Dispatch pipeline, FunctionContext, handler.json, integration points | 9-step pipeline, insertion point for graph dispatch between steps 6-7, handler.json extension proposal |
