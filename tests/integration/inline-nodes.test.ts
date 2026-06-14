/**
 * Integration tests for inline node execution in the compute worker.
 *
 * The inline node registry lets the worker execute FBP native nodes
 * (number, add, select, template, etc.) in-process rather than
 * dispatching an HTTP request to a cloud function. After execution,
 * the same `complete_node` SQL path is used for both inline and cloud
 * invocations — so the graph execution engine sees no difference.
 */
import {
  INLINE_NODES,
  getInlineImpl,
  isGraphJob,
  extractNodeProps
} from '../../job/worker/src/inline-nodes';
import { completeNode, failNode } from '../../job/worker/src/graph-complete';

// ---------------------------------------------------------------------------
// 1. Inline node registry
// ---------------------------------------------------------------------------

describe('inline node registry', () => {
  it('contains implementations for all core native node types', () => {
    const expectedTypes = [
      'number', 'string', 'boolean',
      'add', 'multiply',
      'select', 'object',
      'guard',
      'template', 'concat'
    ];
    for (const t of expectedTypes) {
      expect(INLINE_NODES[t]).toBeDefined();
      expect(typeof INLINE_NODES[t]).toBe('function');
    }
  });

  it('getInlineImpl returns undefined for cloud functions', () => {
    expect(getInlineImpl('send-email')).toBeUndefined();
    expect(getInlineImpl('send-verification-link')).toBeUndefined();
    expect(getInlineImpl('unknown-task')).toBeUndefined();
  });

  it('getInlineImpl returns the impl for known native nodes', () => {
    expect(getInlineImpl('number')).toBeDefined();
    expect(getInlineImpl('add')).toBeDefined();
    expect(getInlineImpl('select')).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 2. Individual node implementations
// ---------------------------------------------------------------------------

describe('inline node implementations', () => {
  describe('const nodes', () => {
    it('number outputs configured value from props', () => {
      const impl = getInlineImpl('number')!;
      expect(impl({}, { value: 42 })).toEqual({ value: 42 });
    });

    it('number defaults to 0 when no prop', () => {
      const impl = getInlineImpl('number')!;
      expect(impl({}, {})).toEqual({ value: 0 });
    });

    it('string outputs configured value from props', () => {
      const impl = getInlineImpl('string')!;
      expect(impl({}, { value: 'hello' })).toEqual({ value: 'hello' });
    });

    it('string defaults to empty string', () => {
      const impl = getInlineImpl('string')!;
      expect(impl({}, {})).toEqual({ value: '' });
    });

    it('boolean outputs configured value from props', () => {
      const impl = getInlineImpl('boolean')!;
      expect(impl({}, { value: true })).toEqual({ value: true });
    });
  });

  describe('math nodes', () => {
    it('add sums two inputs', () => {
      const impl = getInlineImpl('add')!;
      expect(impl({ a: 3, b: 7 }, {})).toEqual({ sum: 10 });
    });

    it('add defaults missing inputs to 0', () => {
      const impl = getInlineImpl('add')!;
      expect(impl({}, {})).toEqual({ sum: 0 });
    });

    it('multiply produces product', () => {
      const impl = getInlineImpl('multiply')!;
      expect(impl({ a: 4, b: 5 }, {})).toEqual({ product: 20 });
    });
  });

  describe('json nodes', () => {
    it('select extracts nested value by dot-path', () => {
      const impl = getInlineImpl('select')!;
      const obj = { user: { email: 'a@b.com' } };
      expect(impl({ obj }, { path: 'user.email' })).toEqual({ value: 'a@b.com' });
    });

    it('select returns undefined for missing path', () => {
      const impl = getInlineImpl('select')!;
      expect(impl({ obj: { a: 1 } }, { path: 'b.c' })).toEqual({ value: undefined });
    });

    it('object merges all inputs into a json object', () => {
      const impl = getInlineImpl('object')!;
      expect(impl({ name: 'Dan', age: 30 }, {})).toEqual({
        value: { name: 'Dan', age: 30 }
      });
    });
  });

  describe('flow nodes', () => {
    it('guard passes when ok is true', () => {
      const impl = getInlineImpl('guard')!;
      const result = impl({ ok: true, error: null }, {});
      expect(result.pass).toBe(true);
      expect(result.fail).toBe(false);
    });

    it('guard fails when ok is false', () => {
      const impl = getInlineImpl('guard')!;
      const result = impl({ ok: false, error: { message: 'bad' } }, {});
      expect(result.pass).toBe(false);
      expect(result.fail).toBe(true);
      expect(result.error).toEqual({ message: 'bad' });
    });
  });

  describe('string nodes', () => {
    it('template replaces {{placeholders}}', () => {
      const impl = getInlineImpl('template')!;
      const result = impl(
        { name: 'World' },
        { template: 'Hello, {{name}}!' }
      );
      expect(result).toEqual({ value: 'Hello, World!' });
    });

    it('concat applies prefix and suffix', () => {
      const impl = getInlineImpl('concat')!;
      expect(
        impl({ value: 'main' }, { prefix: 'pre-', suffix: '-suf' })
      ).toEqual({ value: 'pre-main-suf' });
    });
  });
});

// ---------------------------------------------------------------------------
// 3. Graph job payload detection
// ---------------------------------------------------------------------------

describe('isGraphJob', () => {
  it('returns true for payloads with execution_id and node_name', () => {
    expect(
      isGraphJob({
        execution_id: '00000000-0000-0000-0000-000000000001',
        node_name: 'add_1',
        node_type: 'add',
        inputs: { a: 1, b: 2 }
      })
    ).toBe(true);
  });

  it('returns false for payloads without execution_id', () => {
    expect(isGraphJob({ to: 'a@b.com', subject: 'hi' })).toBe(false);
  });

  it('returns false for undefined/null', () => {
    expect(isGraphJob(undefined)).toBe(false);
    expect(isGraphJob(null)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. Prop extraction from graph job payload
// ---------------------------------------------------------------------------

describe('extractNodeProps', () => {
  it('extracts props array into a key-value map', () => {
    const payload = {
      execution_id: 'exec-1',
      node_name: 'num_1',
      node_type: 'number',
      inputs: {},
      props: [
        { name: 'value', value: 42 }
      ]
    };
    expect(extractNodeProps(payload)).toEqual({ value: 42 });
  });

  it('returns empty object when props are missing', () => {
    expect(extractNodeProps({ execution_id: 'x', node_name: 'y' })).toEqual({});
  });

  it('handles props as a plain object (passthrough)', () => {
    const payload = {
      execution_id: 'x',
      node_name: 'y',
      props: { value: 'hello' }
    };
    expect(extractNodeProps(payload)).toEqual({ value: 'hello' });
  });
});

// ---------------------------------------------------------------------------
// 5. Graph completion helpers (mock SQL calls)
// ---------------------------------------------------------------------------

describe('completeNode', () => {
  it('calls platform_complete_node SQL with correct args', async () => {
    const mockQuery = jest.fn().mockResolvedValue({ rows: [] });
    const mockPool = { query: mockQuery } as any;

    await completeNode(
      mockPool,
      'exec-uuid-123',
      'add_1',
      { sum: 10 }
    );

    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain('platform_complete_node');
    expect(params).toEqual([
      'exec-uuid-123',
      'add_1',
      JSON.stringify({ sum: 10 })
    ]);
  });
});

describe('failNode', () => {
  it('calls platform_fail_node SQL with correct args', async () => {
    const mockQuery = jest.fn().mockResolvedValue({ rows: [] });
    const mockPool = { query: mockQuery } as any;

    await failNode(
      mockPool,
      'exec-uuid-123',
      'bad_node',
      'impl threw an error'
    );

    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain('platform_fail_node');
    expect(params).toEqual([
      'exec-uuid-123',
      'bad_node',
      'impl threw an error'
    ]);
  });
});
