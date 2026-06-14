/**
 * Integration tests for inference metering (fire-and-forget usage logging).
 *
 * Verifies that logInferenceUsage:
 *   1. INSERTs into platform_usage_log_inferences with correct columns
 *   2. Captures model, provider, tokens, latency_ms, status
 *   3. Never throws — metering errors are swallowed
 *   4. Handles both chat and embed services
 *   5. Records error status with error_type for failed inferences
 *   6. Handles null database_id, entity_id, actor_id gracefully
 */

import { logInferenceUsage, _resetCache } from '../../packages/agentic-server/src/inference-meter';

const flush = () => new Promise((r) => setTimeout(r, 20));

describe('logInferenceUsage', () => {
  let mockQuery: jest.Mock;
  let mockPool: any;

  beforeEach(() => {
    _resetCache();
    mockQuery = jest.fn().mockResolvedValue({ rows: [] });
    mockPool = { query: mockQuery } as any;
  });

  it('inserts into platform_usage_log_inferences', async () => {
    logInferenceUsage(mockPool, {
      databaseId: 'db-001',
      entityId: 'entity-001',
      actorId: 'actor-001',
      model: 'gpt-4o',
      provider: 'openai',
      service: 'chat',
      operation: 'chat/completions',
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
      latencyMs: 320,
      status: 'ok'
    });
    await flush();

    // 2 calls: 1 config resolution (metaschema) + 1 insert
    expect(mockQuery).toHaveBeenCalledTimes(2);
    const insertCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('INSERT INTO')
    );
    expect(insertCall).toBeDefined();
    const [sql] = insertCall!;
    expect(sql).toContain('INSERT INTO');
    expect(sql).toContain('platform_usage_log_inferences');
  });

  it('passes correct columns for chat completions', async () => {
    logInferenceUsage(mockPool, {
      databaseId: 'db-aaa',
      entityId: 'entity-bbb',
      actorId: 'actor-ccc',
      model: 'gpt-4o',
      provider: 'openai',
      service: 'chat',
      operation: 'chat/completions',
      inputTokens: 200,
      outputTokens: 80,
      totalTokens: 280,
      latencyMs: 450.7,
      status: 'ok',
      rawUsage: { prompt_tokens: 200, completion_tokens: 80, total_tokens: 280 }
    });
    await flush();

    const insertCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('INSERT INTO')
    );
    const [sql, params] = insertCall!;
    expect(sql).toContain('model');
    expect(sql).toContain('provider');
    expect(sql).toContain('input_tokens');
    expect(sql).toContain('output_tokens');
    expect(sql).toContain('total_tokens');
    expect(sql).toContain('latency_ms');

    // params: [id, database_id, entity_id, actor_id, request_id,
    //          model, provider, service, operation,
    //          input_tokens, output_tokens, total_tokens,
    //          latency_ms, status, error_type, raw_usage, created_at]
    expect(params[0]).toBeDefined();           // id (UUID)
    expect(params[1]).toBe('db-aaa');          // database_id
    expect(params[2]).toBe('entity-bbb');      // entity_id
    expect(params[3]).toBe('actor-ccc');       // actor_id
    expect(params[4]).toBeDefined();           // request_id (UUID)
    expect(params[5]).toBe('gpt-4o');          // model
    expect(params[6]).toBe('openai');          // provider
    expect(params[7]).toBe('chat');            // service
    expect(params[8]).toBe('chat/completions'); // operation
    expect(params[9]).toBe(200);               // input_tokens
    expect(params[10]).toBe(80);               // output_tokens
    expect(params[11]).toBe(280);              // total_tokens
    expect(params[12]).toBe(451);              // latency_ms (rounded)
    expect(params[13]).toBe('ok');             // status
    expect(params[14]).toBeNull();             // error_type
    expect(JSON.parse(params[15])).toEqual({   // raw_usage
      prompt_tokens: 200,
      completion_tokens: 80,
      total_tokens: 280
    });
    expect(params[16]).toBeInstanceOf(Date);   // created_at
  });

  it('logs embed service correctly', async () => {
    logInferenceUsage(mockPool, {
      databaseId: 'db-embed',
      model: 'text-embedding-3-small',
      provider: 'openai',
      service: 'embed',
      operation: 'embeddings',
      inputTokens: 50,
      outputTokens: 0,
      totalTokens: 50,
      latencyMs: 120,
      status: 'ok'
    });
    await flush();

    const insertCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('INSERT INTO')
    );
    const [, params] = insertCall!;
    expect(params[5]).toBe('text-embedding-3-small'); // model
    expect(params[7]).toBe('embed');                   // service
    expect(params[8]).toBe('embeddings');               // operation
    expect(params[9]).toBe(50);                        // input_tokens
    expect(params[10]).toBe(0);                        // output_tokens
  });

  it('records error status with error_type', async () => {
    logInferenceUsage(mockPool, {
      databaseId: 'db-err',
      model: 'gpt-4o',
      provider: 'openai',
      service: 'chat',
      operation: 'chat/completions',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      latencyMs: 50,
      status: 'error',
      errorType: 'upstream_429'
    });
    await flush();

    const insertCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('INSERT INTO')
    );
    const [, params] = insertCall!;
    expect(params[13]).toBe('error');          // status
    expect(params[14]).toBe('upstream_429');   // error_type
  });

  it('handles null database_id, entity_id, actor_id gracefully', async () => {
    logInferenceUsage(mockPool, {
      model: 'llama3',
      provider: 'ollama',
      service: 'chat',
      operation: 'chat/completions',
      inputTokens: 10,
      outputTokens: 20,
      totalTokens: 30,
      latencyMs: 5,
      status: 'ok'
    });
    await flush();

    // 2 calls: 1 config resolution (metaschema) + 1 insert
    expect(mockQuery).toHaveBeenCalledTimes(2);
    const insertCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('INSERT INTO')
    );
    const [, params] = insertCall!;
    expect(params[1]).toBeNull(); // database_id
    expect(params[2]).toBeNull(); // entity_id
    expect(params[3]).toBeNull(); // actor_id
  });

  it('never throws even when pool.query rejects', async () => {
    mockQuery.mockRejectedValue(new Error('connection refused'));

    expect(() => {
      logInferenceUsage(mockPool, {
        model: 'gpt-4o',
        provider: 'openai',
        service: 'chat',
        operation: 'chat/completions',
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        latencyMs: 0,
        status: 'ok'
      });
    }).not.toThrow();

    await flush();
    // 2 calls: config resolution + insert (both reject, but no crash)
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it('rounds latency_ms to nearest integer', async () => {
    logInferenceUsage(mockPool, {
      model: 'gpt-4o',
      provider: 'openai',
      service: 'chat',
      operation: 'chat/completions',
      inputTokens: 10,
      outputTokens: 5,
      totalTokens: 15,
      latencyMs: 3.7,
      status: 'ok'
    });
    await flush();

    const insertCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('INSERT INTO')
    );
    const [, params] = insertCall!;
    expect(params[12]).toBe(4); // Math.round(3.7)
  });

  it('generates unique id and request_id per call', async () => {
    logInferenceUsage(mockPool, {
      model: 'gpt-4o',
      provider: 'openai',
      service: 'chat',
      operation: 'chat/completions',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      latencyMs: 1,
      status: 'ok'
    });
    logInferenceUsage(mockPool, {
      model: 'gpt-4o',
      provider: 'openai',
      service: 'chat',
      operation: 'chat/completions',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      latencyMs: 1,
      status: 'ok'
    });
    await flush();

    // 3 calls: 1 config resolution (deduped via promise) + 2 inserts
    const insertCalls = mockQuery.mock.calls.filter(
      ([sql]: [string]) => sql.includes('INSERT INTO')
    );
    expect(insertCalls.length).toBe(2);
    const id1 = insertCalls[0][1][0];
    const id2 = insertCalls[1][1][0];
    expect(id1).not.toBe(id2);
  });

  it('uses provided requestId when given', async () => {
    logInferenceUsage(mockPool, {
      requestId: 'req-custom-123',
      model: 'gpt-4o',
      provider: 'openai',
      service: 'chat',
      operation: 'chat/completions',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      latencyMs: 1,
      status: 'ok'
    });
    await flush();

    const insertCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('INSERT INTO')
    );
    const [, params] = insertCall!;
    expect(params[4]).toBe('req-custom-123'); // request_id
  });

  it('stores raw_usage as null when not provided', async () => {
    logInferenceUsage(mockPool, {
      model: 'gpt-4o',
      provider: 'openai',
      service: 'chat',
      operation: 'chat/completions',
      inputTokens: 10,
      outputTokens: 5,
      totalTokens: 15,
      latencyMs: 100,
      status: 'ok'
    });
    await flush();

    const insertCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('INSERT INTO')
    );
    const [, params] = insertCall!;
    expect(params[15]).toBeNull(); // raw_usage
  });
});
