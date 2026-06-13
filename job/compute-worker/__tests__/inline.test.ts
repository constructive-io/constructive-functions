/**
 * Unit tests for the inline node registry and implementations.
 */

import { executeInline, getInlineImpl, listInlineNodes } from '../src/inline';

describe('inline node registry', () => {
  test('lists all registered nodes', () => {
    const nodes = listInlineNodes();
    expect(nodes.length).toBeGreaterThanOrEqual(13);
    const names = nodes.map(n => n.name);
    expect(names).toContain('math/add');
    expect(names).toContain('math/multiply');
    expect(names).toContain('math/subtract');
    expect(names).toContain('json/select');
    expect(names).toContain('json/merge');
    expect(names).toContain('json/split');
    expect(names).toContain('string/template');
    expect(names).toContain('flow/guard');
    expect(names).toContain('coerce');
  });

  test('getInlineImpl returns function for registered nodes', () => {
    expect(getInlineImpl('math/add')).toBeTruthy();
    expect(getInlineImpl('unknown/node')).toBeNull();
  });

  test('throws for unregistered node', async () => {
    await expect(executeInline('nonexistent', {})).rejects.toThrow(
      'No inline implementation for "nonexistent"'
    );
  });
});

describe('math nodes', () => {
  test('add', async () => {
    const result = await executeInline('math/add', { a: 5, b: 3 });
    expect(result).toEqual({ sum: 8 });
  });

  test('add with missing inputs defaults to 0', async () => {
    const result = await executeInline('math/add', {});
    expect(result).toEqual({ sum: 0 });
  });

  test('multiply', async () => {
    const result = await executeInline('math/multiply', { a: 4, b: 7 });
    expect(result).toEqual({ product: 28 });
  });

  test('subtract', async () => {
    const result = await executeInline('math/subtract', { a: 10, b: 3 });
    expect(result).toEqual({ difference: 7 });
  });
});

describe('const nodes', () => {
  test('const/number', async () => {
    const result = await executeInline('const/number', {}, { value: 42 });
    expect(result).toEqual({ value: 42 });
  });

  test('const/string', async () => {
    const result = await executeInline('const/string', {}, { value: 'hello' });
    expect(result).toEqual({ value: 'hello' });
  });

  test('const/boolean', async () => {
    const result = await executeInline('const/boolean', {}, { value: true });
    expect(result).toEqual({ value: true });
  });
});

describe('json nodes', () => {
  test('json/select extracts nested value', async () => {
    const result = await executeInline(
      'json/select',
      { obj: { user: { name: 'Dan', age: 30 } } },
      { path: 'user.name' }
    );
    expect(result).toEqual({ value: 'Dan' });
  });

  test('json/select returns undefined for missing path', async () => {
    const result = await executeInline(
      'json/select',
      { obj: { a: 1 } },
      { path: 'b.c' }
    );
    expect(result).toEqual({ value: undefined });
  });

  test('json/select handles array index', async () => {
    const result = await executeInline(
      'json/select',
      { obj: { items: ['a', 'b', 'c'] } },
      { path: 'items.1' }
    );
    expect(result).toEqual({ value: 'b' });
  });

  test('json/object builds from inputs', async () => {
    const result = await executeInline('json/object', { x: 1, y: 'hello' });
    expect(result).toEqual({ value: { x: 1, y: 'hello' } });
  });

  test('json/merge combines two objects', async () => {
    const result = await executeInline('json/merge', {
      a: { x: 1, y: 2 },
      b: { y: 3, z: 4 },
    });
    expect(result).toEqual({ value: { x: 1, y: 3, z: 4 } });
  });

  test('json/split separates by keys', async () => {
    const result = await executeInline(
      'json/split',
      { obj: { a: 1, b: 2, c: 3 } },
      { keys: ['a', 'c'] }
    );
    expect(result).toEqual({
      selected: { a: 1, c: 3 },
      rest: { b: 2 },
    });
  });
});

describe('string nodes', () => {
  test('string/template replaces placeholders', async () => {
    const result = await executeInline(
      'string/template',
      { name: 'Dan', role: 'engineer' },
      { template: 'Hello {{name}}, you are a {{role}}!' }
    );
    expect(result).toEqual({ value: 'Hello Dan, you are a engineer!' });
  });

  test('string/template preserves unresolved placeholders', async () => {
    const result = await executeInline(
      'string/template',
      { name: 'Dan' },
      { template: 'Hi {{name}}, your id is {{id}}' }
    );
    expect(result).toEqual({ value: 'Hi Dan, your id is {{id}}' });
  });
});

describe('flow nodes', () => {
  test('flow/guard passes when ok', async () => {
    const result = await executeInline('flow/guard', { ok: true });
    expect(result.pass).toBe(true);
    expect(result.fail).toBe(false);
  });

  test('flow/guard fails when not ok', async () => {
    const result = await executeInline('flow/guard', { ok: false });
    expect(result.pass).toBe(false);
    expect(result.fail).toBe(true);
  });

  test('coerce to number', async () => {
    const result = await executeInline('coerce', { value: '42' }, { type: 'number' });
    expect(result).toEqual({ value: 42 });
  });

  test('coerce to string', async () => {
    const result = await executeInline('coerce', { value: 42 }, { type: 'string' });
    expect(result).toEqual({ value: '42' });
  });

  test('coerce to boolean', async () => {
    const result = await executeInline('coerce', { value: 1 }, { type: 'boolean' });
    expect(result).toEqual({ value: true });
  });
});
