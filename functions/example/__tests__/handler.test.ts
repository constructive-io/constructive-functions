import { createMockContext } from '../../../tests/helpers/mock-context';
import handler from '../handler';

describe('example handler', () => {
  it('returns expected shape with payload echoed', async () => {
    const result = await handler({ hello: 'world' }, createMockContext());
    expect(result).toMatchObject({ fn: 'example-fn', body: { hello: 'world' } });
  });

  it('includes message in response', async () => {
    const result = await handler({}, createMockContext());
    expect(result).toHaveProperty('message');
  });

  it('throws when params.throw is true', async () => {
    await expect(
      handler({ throw: true }, createMockContext())
    ).rejects.toThrow('THROWN_ERROR');
  });
});
