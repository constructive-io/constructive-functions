/**
 * Inline node registry for FBP native nodes.
 *
 * Maps node type names to pure implementation functions that can be
 * executed directly in the worker process — no HTTP round-trip needed.
 *
 * Every impl follows the same contract as @fbp/evaluator definitions:
 *   (inputs: Record<string, any>, props: Record<string, any>) => Record<string, any>
 *
 * After execution, the worker calls `complete_node` via SQL so the
 * graph execution engine sees no difference between inline and cloud
 * function invocations.
 */

type NodeImplFn = (
  inputs: Record<string, any>,
  props: Record<string, any>
) => Record<string, any> | Promise<Record<string, any>>;

// ── Const nodes ──────────────────────────────────────────────────────

const constNumber: NodeImplFn = (_inputs, props) => ({
  value: props.value ?? 0
});

const constString: NodeImplFn = (_inputs, props) => ({
  value: props.value ?? ''
});

const constBoolean: NodeImplFn = (_inputs, props) => ({
  value: Boolean(props.value)
});

// ── Math nodes ───────────────────────────────────────────────────────

const add: NodeImplFn = (inputs) => ({
  sum: (inputs.a ?? 0) + (inputs.b ?? 0)
});

const multiply: NodeImplFn = (inputs) => ({
  product: (inputs.a ?? 0) * (inputs.b ?? 0)
});

// ── JSON nodes ───────────────────────────────────────────────────────

const jsonSelect: NodeImplFn = (inputs, props) => {
  const { obj } = inputs;
  const { path } = props;

  if (!path || obj === undefined || obj === null) {
    return { value: undefined };
  }

  const parts = (path as string).split('.');
  let current: any = obj;

  for (const part of parts) {
    if (current === undefined || current === null) {
      return { value: undefined };
    }
    const index = parseInt(part, 10);
    if (!isNaN(index) && Array.isArray(current)) {
      current = current[index];
    } else if (typeof current === 'object') {
      current = current[part];
    } else {
      return { value: undefined };
    }
  }

  return { value: current };
};

const jsonObject: NodeImplFn = (inputs) => ({
  value: { ...inputs }
});

// ── Flow nodes ───────────────────────────────────────────────────────

const guard: NodeImplFn = (inputs) => {
  const { ok, error } = inputs;

  if (ok) {
    return { pass: true, fail: false, error: null };
  }
  return {
    pass: false,
    fail: true,
    error: error || { message: 'Guard condition failed' }
  };
};

// ── String nodes ─────────────────────────────────────────────────────

const template: NodeImplFn = (inputs, props) => {
  const { template: tpl } = props;

  if (!tpl) {
    return { value: '' };
  }

  const result = (tpl as string).replace(
    /\{\{(\w+)\}\}/g,
    (_match: string, key: string) => {
      const value = inputs[key];
      if (value === undefined || value === null) {
        return _match;
      }
      return String(value);
    }
  );

  return { value: result };
};

const concat: NodeImplFn = (inputs, props) => {
  const { value = '' } = inputs;
  const { prefix = '', suffix = '' } = props;
  return { value: `${prefix}${value}${suffix}` };
};

// ── Registry ─────────────────────────────────────────────────────────

export const INLINE_NODES: Record<string, NodeImplFn> = {
  // const
  number: constNumber,
  string: constString,
  boolean: constBoolean,

  // math
  add,
  multiply,

  // json
  select: jsonSelect,
  object: jsonObject,

  // flow
  guard,

  // string
  template,
  concat
};

/**
 * Look up an inline implementation by task identifier.
 * Returns undefined when the task should be dispatched via HTTP instead.
 */
export const getInlineImpl = (taskIdentifier: string): NodeImplFn | undefined =>
  INLINE_NODES[taskIdentifier];

// ── Payload helpers ──────────────────────────────────────────────────

interface GraphJobPayload {
  execution_id: string;
  node_name: string;
  node_type?: string;
  inputs?: Record<string, any>;
  props?: Array<{ name: string; value: any }> | Record<string, any>;
}

/**
 * Detect whether a job payload is a graph execution dispatch
 * (as opposed to a direct cloud-function invocation like send-email).
 */
export const isGraphJob = (payload: unknown): payload is GraphJobPayload => {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  return typeof p.execution_id === 'string' && typeof p.node_name === 'string';
};

/**
 * Extract node props from the job payload into a flat key-value map.
 * Props may arrive as an array of {name, value} objects (from tick_execution)
 * or as a plain object (passthrough).
 */
export const extractNodeProps = (
  payload: unknown
): Record<string, any> => {
  if (!payload || typeof payload !== 'object') return {};
  const p = payload as Record<string, unknown>;
  const raw = p.props;

  if (!raw) return {};

  if (Array.isArray(raw)) {
    const out: Record<string, any> = {};
    for (const item of raw) {
      if (
        item &&
        typeof item === 'object' &&
        'name' in item &&
        'value' in item
      ) {
        out[(item as { name: string }).name] = (item as { value: any }).value;
      }
    }
    return out;
  }

  if (typeof raw === 'object') {
    return raw as Record<string, any>;
  }

  return {};
};
