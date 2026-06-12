# Constructive Functions — Evolution Plan

## Related Planning Issues

| Issue | Title | Status After This Session |
|-------|-------|--------------------------|
| [#1044](https://github.com/constructive-io/constructive-planning/issues/1044) | ComputeModuleLoader — metaschema-based schema/table resolution | **Done** — implemented in PR #90 |
| [#1045](https://github.com/constructive-io/constructive-planning/issues/1045) | Refactor compute-worker — dynamic schema + org-scoped invocations | **Done** — invocation tracking works end-to-end |
| [#1007](https://github.com/constructive-io/constructive-planning/issues/1007) | Final Constructive Functions Sprints | Active — this plan refines Goals 1-4 |
| [#827](https://github.com/constructive-io/constructive-planning/issues/827) | Cloud Functions: Master Registry & Implementation Tracker | Active — function registry |

---

## 1. GUC Propagation in Compute-Worker

### Problem

The compute-worker dispatches jobs via HTTP headers (`X-Database-Id`, `X-Actor-Id`, `X-Entity-Id`) but **never sets PostgreSQL GUC variables** (`jwt.claims.*`) on the connection used for invocation tracking. This means:

- RLS policies can't see who triggered the invocation
- `current_setting('jwt.claims.user_id')` returns nothing inside triggers
- Billing functions that need `entity_id` context won't work

### Current State

```
app_jobs.jobs columns:
  id, database_id, actor_id, entity_id, organization_id, entity_type,
  queue_name, task_identifier, payload, priority, ...

compute_request HTTP headers sent:
  X-Database-Id, X-Actor-Id, X-Entity-Id, X-Worker-Id, X-Job-Id, X-Invocation-Id

GUCs set on PG connection: NONE
```

### What's Missing

The `ComputeJobRow` type only reads `id, task_identifier, payload, database_id, actor_id, entity_id`. It ignores `organization_id` and `entity_type` from the jobs table.

### Proposed Fix

**A) Set GUCs before invocation INSERT** — in `doWork()`, before creating the invocation record:

```typescript
// Set GUCs on the connection used for invocation tracking
async setJobContext(client: PgClientLike, job: ComputeJobRow): Promise<void> {
  const gucs: [string, string][] = [];
  if (job.database_id)      gucs.push(['jwt.claims.database_id', job.database_id]);
  if (job.actor_id)          gucs.push(['jwt.claims.user_id', job.actor_id]);
  if (job.entity_id)         gucs.push(['jwt.claims.entity_id', job.entity_id]);
  if (job.organization_id)   gucs.push(['jwt.claims.organization_id', job.organization_id]);

  for (const [key, val] of gucs) {
    await client.query(`SELECT set_config($1, $2, true)`, [key, val]);
  }
}
```

**B) Extend `ComputeJobRow`** to include `organization_id` and `entity_type`:

```typescript
interface ComputeJobRow {
  id: number | string;
  task_identifier: string;
  payload?: unknown;
  database_id?: string;
  actor_id?: string;
  entity_id?: string;
  organization_id?: string;  // NEW
  entity_type?: string;       // NEW
}
```

**C) Propagate to HTTP dispatch** — add `X-Organization-Id` header in `compute_request()`.

### Complexity: Low — ~2 hours

---

## 2. Billing / Usage Metering Integration

### Problem

The billing infrastructure exists in constructive-db (`billing_module` generator creates meters, ledger, balances, `record_usage` function). The `agentic-server` already uses it. But the **generic compute-worker** doesn't integrate billing at all.

### Architecture

```
billing_module in metaschema:
  - meters_table, ledger_table, balances_table
  - record_usage_function (e.g. "record_usage")
  - check_billing_quota is a convention (in private schema)

Agentic-server pattern (already working):
  1. checkQuota(ctx, billing, entityId, meterSlug) → allowed?
  2. Dispatch function
  3. recordUsage(ctx, billing, entityId, meterSlug, amount, metadata)
```

### Proposed Design

**A) Add `BillingTracker` to compute-worker** (parallel to `InvocationTracker`):

```typescript
class BillingTracker {
  constructor(pool: Pool, loader: ComputeModuleLoader) {}

  // Discover billing_module from metaschema (TTL-cached like invocation modules)
  async load(databaseId: string): Promise<BillingConfig | null>

  // Before dispatch: check if entity has quota
  async checkQuota(entityId: string, meterSlug: string): Promise<boolean>

  // After dispatch: record usage
  async recordUsage(entityId: string, meterSlug: string, amount: number, metadata: object): Promise<void>
}
```

**B) Map `task_identifier` → `meter_slug`** — two options:
  1. Add `meter_slug` column to `platform_function_definitions` (explicit per-function)
  2. Convention: `meter_slug = task_identifier` (zero config)
  
  Recommend option 2 with opt-out: default to `task_identifier` as the meter slug unless the definition has a custom `meter_slug` value.

**C) Integrate into `doWork()` flow:**

```
1. Resolve function definition
2. Check billing quota (if billing_module provisioned + entity_id present)
   → If denied, fail job with "billing quota exceeded"
3. Create invocation record
4. Dispatch to function URL
5. On success: record_usage(meter_slug, entity_id, 1, {duration_ms, task_identifier})
6. On failure: still record_usage but with amount=0 and error metadata
```

**D) Graceful degradation** — If no `billing_module` is registered in metaschema (i.e., standalone dev mode), skip billing entirely. This matches how `agentic-server` handles it.

### DB Schema Addition

Add `meter_slug` column to `platform_function_definitions`:

```sql
ALTER TABLE constructive_compute_public.platform_function_definitions
  ADD COLUMN meter_slug text;
-- Default: NULL means "use task_identifier"
```

Or as a new pgpm migration in `constructive-compute`.

### Complexity: Medium — ~4-6 hours

---

## 3. Graph / Flow Visualization & Execution

### Current State

**What exists:**
- `constructive_platform_function_graph_public` schema: merkle store tables (`*_store`, `*_object`, `*_commit`, `*_ref`)
- `FlowsPanel.tsx`: visual graph editor with `@fbp/graph-editor` + `@fbp/evaluator`
- Graphs are saved to **localStorage only** (`constructive-flows-v2` key)
- The FBP evaluator runs in-browser (pure JS evaluation of math/string/json nodes)
- No server-side execution — functions can't actually be dispatched from a flow

**What the FBP DB engine can do** (in constructive-db, not yet wired):
- `start_execution(graph_id)` → creates execution, enqueues root nodes
- `tick_execution(execution_id)` → advances ready nodes, fires jobs
- `complete_node(execution_id, node_name, output)` → marks node done, unlocks downstream
- `validate_function_graph(graph_data)` → checks for cycles, unconnected ports

### Proposed Phases

#### Phase 3A: Persist Flows to Merkle Store (via GraphQL)

Wire the FlowsPanel's Save/Load to the `platform_function_graph_*` tables instead of localStorage:

```typescript
// Save: serialize graph → JSON → create object → create commit → update ref
const objectId = await objects.createPlatformFunctionGraphObject({ data: graphJson });
const commitId = await objects.createPlatformFunctionGraphCommit({ 
  storeId, objectId, parentCommitId 
});
await objects.updatePlatformFunctionGraphRef({ commitId });

// Load: ref → commit → object → deserialize graph
const ref = await objects.platformFunctionGraphRef({ name: 'main', storeId });
const commit = await objects.platformFunctionGraphCommit({ id: ref.commitId });
const object = await objects.platformFunctionGraphObject({ id: commit.objectId });
const graph = JSON.parse(object.data);
```

This gives us:
- Version history (each save creates a new commit)
- Named refs (branches/tags for flows)
- Content-addressable storage (deduplication)

#### Phase 3B: Server-Side Graph Execution

Wire graph execution to the compute-worker job queue:

1. User clicks "Run Flow" in the UI
2. Frontend inserts a job: `INSERT INTO app_jobs.jobs (task_identifier, payload) VALUES ('fbp:execute_graph', {graph_id, inputs})`
3. Compute-worker picks up the job
4. `fbp:execute_graph` handler:
   - Loads the graph from the merkle store
   - For each node that maps to a registered function, creates a sub-job
   - Tracks execution state in `platform_function_invocations` with `graph_execution_id`
   - Pipes outputs to downstream nodes' inputs
5. Results flow back via the invocation tracking table

#### Phase 3C: Live Execution Visualization

- Poll `platform_function_invocations WHERE graph_execution_id = ?` to show node status
- Color nodes: gray (pending) → blue (running) → green (completed) → red (failed)
- Show duration_ms and result/error in node tooltip

### Complexity: Phase 3A (Medium, ~4h), 3B (High, ~8-12h), 3C (Low, ~2h)

---

## 4. Other Items to Consider

### A) Secrets Resolution at Dispatch Time

Currently the compute-worker sends HTTP headers but doesn't resolve encrypted secrets. The function must read secrets from the DB itself. Consider:

- **Option 1:** Worker resolves secrets from `encrypted_secrets` and injects them as headers or env → simpler for functions, but secrets transit over HTTP
- **Option 2 (current):** Functions query their own secrets at startup → more secure, already works via `dev-compute.ts` platform_secrets loading

Recommend keeping Option 2 for security but adding a `--inject-secrets` flag for local dev convenience.

### B) Function Health Checks

No health check mechanism exists. If a function crashes, the worker retries `max_attempts` times but has no circuit breaker. Consider:

- Periodic `GET /health` to each function's `service_url`
- Mark unhealthy functions as `is_invocable = false` temporarily
- Expose health status in the www StatusBar

### C) Payload Schema Validation

`platform_function_definitions` has no `payload_schema` column (it was removed). But `handler.json` has `payloadSchema`. Consider:

- Adding `payload_schema jsonb` column to the definitions table
- Validating payloads against the schema before dispatch (fail fast)
- Using the schema in the www NewJobForm to render dynamic form fields

### D) Execution Logs

`platform_function_execution_logs` exists but is never written to. It should capture:

- Full request/response bodies (truncated for large payloads)
- HTTP status code from the function
- Timing breakdown (queue wait, dispatch latency, function execution)
- Worker ID and host

### E) `organization_id` vs `entity_id`

The jobs table has both `entity_id` and `organization_id`. The compute-worker only reads `entity_id`. Need to clarify:

- Is `organization_id` the parent org while `entity_id` is the specific tenant/team?
- Should billing be charged to `organization_id` or `entity_id`?
- The invocation table has neither — which should be added?

---

## Suggested Priority Order

```
Priority 1 (Foundation):
  ├── GUC propagation in compute-worker (#1)
  ├── Persist flows to merkle store (#3A)
  └── ComputeJobRow extended fields

Priority 2 (Billing):
  ├── BillingTracker in compute-worker (#2)
  ├── meter_slug column on definitions
  └── Quota check + usage recording in doWork()

Priority 3 (Execution):
  ├── Server-side graph execution (#3B)
  ├── fbp:execute_graph function
  └── Live execution visualization (#3C)

Priority 4 (Polish):
  ├── Execution logs
  ├── Payload schema validation
  ├── Function health checks
  └── Secrets injection (dev mode)
```
