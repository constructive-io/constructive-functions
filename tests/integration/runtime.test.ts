import { startFunction } from './helpers/start-function';
import path from 'path';

const EXAMPLE_MODULE = path.resolve(
  __dirname,
  '../../generated/example/dist/index.js'
);
const PORT = 19876;

describe('fn-runtime HTTP layer', () => {
  let url: string;
  let close: () => Promise<void>;

  beforeAll(async () => {
    const started = await startFunction(EXAMPLE_MODULE, PORT);
    url = started.url;
    close = started.close;
  });

  afterAll(async () => {
    if (close) await close();
  });

  it('POST / returns 200 with handler result', async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hello: 'world' })
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ fn: 'example-fn' });
  });

  it('passes job headers to handler context', async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Job-Id': 'job-123',
        'X-Worker-Id': 'worker-456',
        'X-Database-Id': 'db-789'
      },
      body: JSON.stringify({})
    });
    expect(res.status).toBe(200);
  });

  it('handler error returns 200 with { message }', async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ throw: true })
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('message');
  });
});
