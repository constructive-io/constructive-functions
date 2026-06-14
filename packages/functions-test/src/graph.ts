import type { PgTestClient } from 'pgsql-test/test-client';

// ─── Types ──────────────────────────────────────────────────────────────

export interface GraphNode {
  name: string;
  type: string;
  props?: Array<{ name: string; value: string }>;
  meta?: Record<string, unknown>;
}

export interface GraphEdge {
  src: { node: string; port: string };
  dst: { node: string; port: string };
}

export interface GraphJson {
  context?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  definitions?: Array<Record<string, unknown>>;
}

export interface GraphExecution {
  id: string;
  graph_id: string;
  database_id: string;
  status: string;
  input_payload: Record<string, unknown>;
  output_payload: Record<string, unknown> | null;
  node_outputs: Record<string, string>;
  tick_count: number;
  max_ticks: number;
  max_pending_jobs: number;
  error_code: string | null;
  error_message: string | null;
  output_node: string;
  output_port: string;
  started_at: Date;
  completed_at: Date | null;
  timeout_at: Date;
}

export interface GraphJob {
  id: number;
  database_id: string;
  task_identifier: string;
  payload: {
    execution_id: string;
    node_name: string;
    node_type: string;
    inputs: Record<string, unknown>;
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────

/**
 * Import a graph from JSON into the merkle store and create a
 * `platform_function_graphs` row. Returns the graph ID.
 */
export async function importGraphJson(
  client: PgTestClient,
  databaseId: string,
  name: string,
  graphJson: GraphJson
): Promise<string> {
  const result = await client.one<{ platform_import_graph_json: string }>(
    `SELECT constructive_compute_public.platform_import_graph_json($1::uuid, $2, $3::jsonb)`,
    [databaseId, name, JSON.stringify(graphJson)]
  );
  return result.platform_import_graph_json;
}

/**
 * Start a graph execution. Seeds boundary nodes and fires tick_execution.
 * Returns the execution ID.
 */
export async function startExecution(
  client: PgTestClient,
  graphId: string,
  inputPayload: Record<string, unknown> = {},
  opts: {
    outputNode?: string;
    outputPort?: string;
    maxTicks?: number;
    maxPendingJobs?: number;
  } = {}
): Promise<string> {
  const parts = ['$1::uuid', '$2::jsonb'];
  const values: unknown[] = [graphId, JSON.stringify(inputPayload)];
  let idx = 3;

  if (opts.outputNode !== undefined) {
    parts.push(`output_node := $${idx}`);
    values.push(opts.outputNode);
    idx++;
  }
  if (opts.outputPort !== undefined) {
    parts.push(`output_port := $${idx}`);
    values.push(opts.outputPort);
    idx++;
  }
  if (opts.maxTicks !== undefined) {
    parts.push(`max_ticks := $${idx}`);
    values.push(opts.maxTicks);
    idx++;
  }
  if (opts.maxPendingJobs !== undefined) {
    parts.push(`max_pending_jobs := $${idx}`);
    values.push(opts.maxPendingJobs);
    idx++;
  }

  const result = await client.one<{ platform_start_execution: string }>(
    `SELECT constructive_compute_public.platform_start_execution(${parts.join(', ')})`,
    values
  );
  return result.platform_start_execution;
}

/**
 * Get an execution by ID.
 */
export async function getExecution(
  client: PgTestClient,
  executionId: string
): Promise<GraphExecution | null> {
  return client.oneOrNone<GraphExecution>(
    `SELECT * FROM constructive_compute_public.platform_function_graph_executions WHERE id = $1`,
    [executionId]
  );
}

/**
 * Call complete_node — same procedure the compute-worker calls after HTTP dispatch.
 */
export async function completeNode(
  client: PgTestClient,
  executionId: string,
  nodeName: string,
  outputData: unknown
): Promise<void> {
  await client.query(
    `SELECT constructive_compute_private.platform_complete_node($1::uuid, $2, $3::jsonb)`,
    [executionId, nodeName, JSON.stringify(outputData ?? {})]
  );
}

/**
 * Get all pending graph node jobs from the job queue for a given execution.
 */
export async function getGraphJobs(
  client: PgTestClient,
  executionId: string
): Promise<GraphJob[]> {
  const result = await client.query<GraphJob>(
    `SELECT id, database_id, task_identifier, payload::jsonb as payload
     FROM app_jobs.jobs
     WHERE (payload::jsonb->>'execution_id')::uuid = $1::uuid
     ORDER BY id`,
    [executionId]
  );
  return result.rows;
}

/**
 * Register a function definition in the platform.
 * This is needed so the compute-worker can resolve function names.
 */
export interface PortDef {
  name: string;
  type: string;
  description?: string;
  optional?: boolean;
}

export interface PropDef {
  name: string;
  type: string;
  default?: unknown;
  description?: string;
  required?: boolean;
}

export async function registerFunction(
  client: PgTestClient,
  _databaseId: string,
  name: string,
  serviceUrl: string,
  opts: {
    description?: string;
    isInvocable?: boolean;
    inputs?: PortDef[];
    outputs?: PortDef[];
    props?: PropDef[];
    volatile?: boolean;
    icon?: string;
    category?: string;
    runtime?: 'http' | 'inline';
  } = {}
): Promise<string> {
  const result = await client.one<{ id: string }>(
    `INSERT INTO constructive_compute_public.platform_function_definitions
       (name, task_identifier, service_url, is_invocable, scope, description,
        inputs, outputs, props, volatile, icon, category, runtime)
     VALUES ($1, $1, $2, $3, 'platform', $4,
             $5::jsonb, $6::jsonb, $7::jsonb, $8, $9, $10, $11)
     ON CONFLICT (scope, name) DO UPDATE SET
       service_url = EXCLUDED.service_url,
       inputs = EXCLUDED.inputs,
       outputs = EXCLUDED.outputs,
       props = EXCLUDED.props,
       volatile = EXCLUDED.volatile,
       icon = EXCLUDED.icon,
       category = EXCLUDED.category,
       runtime = EXCLUDED.runtime
     RETURNING id`,
    [
      name,
      serviceUrl,
      opts.isInvocable !== false,
      opts.description ?? name,
      JSON.stringify(opts.inputs ?? []),
      JSON.stringify(opts.outputs ?? []),
      JSON.stringify(opts.props ?? []),
      opts.volatile ?? false,
      opts.icon ?? null,
      opts.category ?? null,
      opts.runtime ?? 'http',
    ]
  );
  return result.id;
}

/**
 * Call fail_node — marks a node as failed and the execution as failed.
 */
export async function failNode(
  client: PgTestClient,
  executionId: string,
  nodeName: string,
  errorCode: string,
  errorMessage: string
): Promise<void> {
  await client.query(
    `SELECT constructive_compute_private.platform_fail_node($1::uuid, $2, $3, $4)`,
    [executionId, nodeName, errorCode, errorMessage]
  );
}

/**
 * Get node states for an execution.
 */
export interface NodeState {
  id: string;
  execution_id: string;
  node_name: string;
  status: string;
  started_at: Date | null;
  completed_at: Date | null;
  output_id: string | null;
  error_code: string | null;
  error_message: string | null;
}

export async function getNodeStates(
  client: PgTestClient,
  executionId: string
): Promise<NodeState[]> {
  const result = await client.query<NodeState>(
    `SELECT * FROM constructive_compute_public.platform_function_graph_execution_node_states
     WHERE execution_id = $1::uuid
     ORDER BY node_name`,
    [executionId]
  );
  return result.rows;
}

/**
 * Build a simple calculator flow graph JSON:
 *   graphInput(a) → graphInput(b) → add(a+b) → double(result*2) → graphOutput
 *
 * The `add` function receives inputs {a, b} and should return {result}.
 * The `double` function receives {value} and should return {result}.
 */
export function buildCalculatorGraph(): GraphJson {
  return {
    context: 'function',
    nodes: [
      { name: 'input_a', type: 'graphInput', props: [{ name: 'portName', value: 'a' }] },
      { name: 'input_b', type: 'graphInput', props: [{ name: 'portName', value: 'b' }] },
      { name: 'add_node', type: 'add' },
      { name: 'double_node', type: 'double' },
      { name: 'output_result', type: 'graphOutput' },
    ],
    edges: [
      { src: { node: 'input_a', port: 'value' }, dst: { node: 'add_node', port: 'a' } },
      { src: { node: 'input_b', port: 'value' }, dst: { node: 'add_node', port: 'b' } },
      { src: { node: 'add_node', port: 'result' }, dst: { node: 'double_node', port: 'value' } },
      { src: { node: 'double_node', port: 'result' }, dst: { node: 'output_result', port: 'value' } },
    ],
  };
}

/**
 * Build a parallel-branch graph:
 *   graphInput(x) ──┬── double(x*2) ──┬── merge(a+b) → graphOutput
 *                   └── triple(x*3) ──┘
 *
 * Both `double` and `triple` run concurrently (same wave).
 * `merge` waits for both inputs before executing.
 */
export function buildParallelGraph(): GraphJson {
  return {
    context: 'function',
    nodes: [
      { name: 'input_x', type: 'graphInput', props: [{ name: 'portName', value: 'x' }] },
      { name: 'double_node', type: 'double' },
      { name: 'triple_node', type: 'triple' },
      { name: 'merge_node', type: 'merge' },
      { name: 'output_result', type: 'graphOutput' },
    ],
    edges: [
      { src: { node: 'input_x', port: 'value' }, dst: { node: 'double_node', port: 'value' } },
      { src: { node: 'input_x', port: 'value' }, dst: { node: 'triple_node', port: 'value' } },
      { src: { node: 'double_node', port: 'result' }, dst: { node: 'merge_node', port: 'a' } },
      { src: { node: 'triple_node', port: 'result' }, dst: { node: 'merge_node', port: 'b' } },
      { src: { node: 'merge_node', port: 'result' }, dst: { node: 'output_result', port: 'value' } },
    ],
  };
}
