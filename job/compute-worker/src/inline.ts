/**
 * InlineNodeRegistry — built-in node implementations that run in-process
 * without HTTP dispatch. These are pure functions (non-volatile) that
 * execute in microseconds, keeping the job queue fast.
 *
 * Each node is a simple function: (inputs, props) => outputs
 * matching the @fbp/evaluator NodeImplFn signature.
 */

import { Logger } from '@pgpmjs/logger';

const log = new Logger('compute:inline');

export type InlineImplFn = (
  inputs: Record<string, unknown>,
  props: Record<string, unknown>
) => Record<string, unknown> | Promise<Record<string, unknown>>;

export interface InlineNodeDef {
  name: string;
  category: string;
  impl: InlineImplFn;
}

// ─── Built-in implementations ──────────────────────────────────────────────

const add: InlineImplFn = (inputs) => ({
  sum: (Number(inputs.a) || 0) + (Number(inputs.b) || 0),
});

const multiply: InlineImplFn = (inputs) => ({
  product: (Number(inputs.a) || 0) * (Number(inputs.b) || 0),
});

const subtract: InlineImplFn = (inputs) => ({
  difference: (Number(inputs.a) || 0) - (Number(inputs.b) || 0),
});

const constNumber: InlineImplFn = (_inputs, props) => ({
  value: Number(props.value) || 0,
});

const constString: InlineImplFn = (_inputs, props) => ({
  value: String(props.value ?? ''),
});

const constBoolean: InlineImplFn = (_inputs, props) => ({
  value: Boolean(props.value),
});

const jsonSelect: InlineImplFn = (inputs, props) => {
  const { obj } = inputs;
  const path = String(props.path ?? '');
  if (!path || obj === undefined || obj === null) return { value: undefined };

  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return { value: undefined };
    const index = parseInt(part, 10);
    if (!isNaN(index) && Array.isArray(current)) {
      current = (current as unknown[])[index];
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return { value: undefined };
    }
  }
  return { value: current };
};

const jsonObject: InlineImplFn = (inputs) => ({
  value: { ...inputs },
});

const jsonMerge: InlineImplFn = (inputs) => {
  const a = (inputs.a && typeof inputs.a === 'object') ? inputs.a as Record<string, unknown> : {};
  const b = (inputs.b && typeof inputs.b === 'object') ? inputs.b as Record<string, unknown> : {};
  return { value: { ...a, ...b } };
};

const jsonSplit: InlineImplFn = (inputs, props) => {
  const obj = inputs.obj as Record<string, unknown> | undefined;
  const keys = (props.keys as string[] | undefined) ?? [];
  if (!obj || typeof obj !== 'object') return { selected: {}, rest: {} };

  const selected: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (keys.includes(k)) {
      selected[k] = v;
    } else {
      rest[k] = v;
    }
  }
  return { selected, rest };
};

const stringTemplate: InlineImplFn = (inputs, props) => {
  const template = String(props.template ?? '');
  if (!template) return { value: '' };

  const result = template.replace(/\{\{(\w+)\}\}/g, (_match: string, key: string) => {
    const value = inputs[key];
    if (value === undefined || value === null) return _match;
    return String(value);
  });
  return { value: result };
};

const flowGuard: InlineImplFn = (inputs) => {
  const ok = Boolean(inputs.ok);
  if (ok) {
    return { pass: true, fail: false, error: null };
  }
  return {
    pass: false,
    fail: true,
    error: inputs.error || { message: 'Guard condition failed' },
  };
};

const coerce: InlineImplFn = (inputs, props) => {
  const targetType = String(props.type ?? 'string');
  const val = inputs.value;
  switch (targetType) {
    case 'number': return { value: Number(val) };
    case 'boolean': return { value: Boolean(val) };
    case 'string': return { value: String(val ?? '') };
    case 'json': return { value: typeof val === 'string' ? JSON.parse(val) : val };
    default: return { value: val };
  }
};

// ─── Registry ──────────────────────────────────────────────────────────────

const INLINE_NODES: InlineNodeDef[] = [
  { name: 'math/add', category: 'math', impl: add },
  { name: 'math/multiply', category: 'math', impl: multiply },
  { name: 'math/subtract', category: 'math', impl: subtract },
  { name: 'const/number', category: 'const', impl: constNumber },
  { name: 'const/string', category: 'const', impl: constString },
  { name: 'const/boolean', category: 'const', impl: constBoolean },
  { name: 'json/select', category: 'json', impl: jsonSelect },
  { name: 'json/object', category: 'json', impl: jsonObject },
  { name: 'json/merge', category: 'json', impl: jsonMerge },
  { name: 'json/split', category: 'json', impl: jsonSplit },
  { name: 'string/template', category: 'string', impl: stringTemplate },
  { name: 'flow/guard', category: 'flow', impl: flowGuard },
  { name: 'coerce', category: 'flow', impl: coerce },
];

const registry = new Map<string, InlineImplFn>();
for (const node of INLINE_NODES) {
  registry.set(node.name, node.impl);
}

/**
 * Look up an inline node implementation by task_identifier.
 * Returns null if not registered as inline.
 */
export function getInlineImpl(taskIdentifier: string): InlineImplFn | null {
  return registry.get(taskIdentifier) ?? null;
}

/**
 * Execute an inline node synchronously (or await if async).
 * Returns the output record.
 */
export async function executeInline(
  taskIdentifier: string,
  inputs: Record<string, unknown>,
  props: Record<string, unknown> = {}
): Promise<Record<string, unknown>> {
  const impl = registry.get(taskIdentifier);
  if (!impl) {
    throw new Error(`No inline implementation for "${taskIdentifier}"`);
  }
  log.debug(`executing inline node: ${taskIdentifier}`);
  return await impl(inputs, props);
}

/**
 * Get all registered inline node definitions (for diagnostics / registration).
 */
export function listInlineNodes(): InlineNodeDef[] {
  return [...INLINE_NODES];
}
