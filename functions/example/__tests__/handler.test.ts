import { createMockContext } from '../../../tests/helpers/mock-context';
import handler from '../handler';

describe('example handler', () => {
  it('returns expected shape with payload echoed', async () => {
    const result = await handler({ hello: 'world' }, createMockContext());
    expect(result).toMatchObject({ status: 'ok', received: { hello: 'world' } });
  });

  it('includes status and timestamp in response', async () => {
    const result = await handler({}, createMockContext());
    expect(result).toHaveProperty('status', 'ok');
    expect(result).toHaveProperty('timestamp');
  });

  it('echoes params including unknown keys', async () => {
    const result = await handler({ throw: true }, createMockContext());
    expect(result).toMatchObject({ status: 'ok', received: { throw: true } });
  });
});
