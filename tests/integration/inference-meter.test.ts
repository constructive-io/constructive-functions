/**
 * Integration tests for inference metering (fire-and-forget usage logging).
 *
 * Verifies that logInferenceUsage:
 *   1. Resolves table names via ModuleLoader (metaschema query)
 *   2. INSERTs into the resolved compute_log table with correct columns
 *   3. Never throws — metering errors are swallowed
 *   4. Handles both chat and embed services
 *   5. Records error status with error_type for failed inferences
 *   6. Rounds latency_ms to nearest integer
 */

import { logInferenceUsage } from '../../packages/agentic-server/src/inference-meter';
import { createModuleMockQuery, MODULE_CONFIGS } from './helpers/module-mock';

const flush = () => new Promise((r) => setTimeout(r, 20));

/** Filter query calls to INSERT statements */
function insertCalls(mockQuery: jest.Mock) {
  return mockQuery.mock.calls.filter(
    ([sql]: [string]) => sql.includes('INSERT INTO')
  );
}

describe('logInferenceUsage', () => {
  let mockQuery: jest.Mock;
  let mockPool: any;

  beforeEach(() => {
    mockQuery = createModuleMockQuery();
    mockPool = { query: mockQuery } as any;
  });

  it('resolves table names from MetaSchema and inserts', async () => {
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

    // 1 config resolution (metaschema) + 1 insert
    expect(mockQuery).toHaveBeenCalledTimes(2);
    const inserts = insertCalls(mockQuery);
    expect(inserts).toHaveLength(1);
    const [sql] = inserts[0];
    expect(sql).toContain('INSERT INTO');
    expect(sql).toContain(MODULE_CONFIGS.computeLog.compute_log_table_name);
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

    const inserts = insertCalls(mockQuery);
    expect(inserts).toHaveLength(1);
    const [sql, params] = inserts[0];
    expect(sql).toContain('model');
    expect(sql).toContain('provider');
    expect(sql).toContain('input_tokens');
    expect(sql).toContain('output_tokens');
    expect(sql).toContain('total_tokens');
    expect(sql).toContain('latency_ms');

    // params: [database_id, entity_id, actor_id, request_id,
    //          model, provider, service, operation,
    //          input_tokens, output_tokens, total_tokens,
    //          latency_ms, status, error_type, raw_usage]
    expect(params[0]).toBe('db-aaa');          // database_id
    expect(params[1]).toBe('entity-bbb');      // entity_id
    expect(params[2]).toBe('actor-ccc');       // actor_id
    expect(params[3]).toBeNull();              // request_id (not provided)
    expect(params[4]).toBe('gpt-4o');          // model
    expect(params[5]).toBe('openai');          // provider
    expect(params[6]).toBe('chat');            // service
    expect(params[7]).toBe('chat/completions'); // operation
    expect(params[8]).toBe(200);               // input_tokens
    expect(params[9]).toBe(80);                // output_tokens
    expect(params[10]).toBe(280);              // total_tokens
    expect(params[11]).toBe(451);              // latency_ms (rounded)
    expect(params[12]).toBe('ok');             // status
    expect(params[13]).toBeNull();             // error_type
    expect(JSON.parse(params[14])).toEqual({   // raw_usage
      prompt_tokens: 200,
      completion_tokens: 80,
      total_tokens: 280
    });
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

    const inserts = insertCalls(mockQuery);
    expect(inserts).toHaveLength(1);
    const [, params] = inserts[0];
    expect(params[4]).toBe('text-embedding-3-small'); // model
    expect(params[6]).toBe('embed');                   // service
    expect(params[7]).toBe('embeddings');               // operation
    expect(params[8]).toBe(50);                        // input_tokens
    expect(params[9]).toBe(0);                         // output_tokens
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

    const inserts = insertCalls(mockQuery);
    expect(inserts).toHaveLength(1);
    const [, params] = inserts[0];
    expect(params[12]).toBe('error');          // status
    expect(params[13]).toBe('upstream_429');   // error_type
  });

  it('handles null entity_id, actor_id gracefully', async () => {
    logInferenceUsage(mockPool, {
      databaseId: 'db-null',
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

    const inserts = insertCalls(mockQuery);
    expect(inserts).toHaveLength(1);
    const [, params] = inserts[0];
    expect(params[0]).toBe('db-null');   // database_id
    expect(params[1]).toBeNull();        // entity_id
    expect(params[2]).toBeNull();        // actor_id
  });

  it('never throws even when pool.query rejects', async () => {
    mockQuery.mockRejectedValue(new Error('connection refused'));

    expect(() => {
      logInferenceUsage(mockPool, {
        databaseId: 'db-fail',
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
  });

  it('rounds latency_ms to nearest integer', async () => {
    logInferenceUsage(mockPool, {
      databaseId: 'db-round',
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

    const inserts = insertCalls(mockQuery);
    expect(inserts).toHaveLength(1);
    const [, params] = inserts[0];
    expect(params[11]).toBe(4); // Math.round(3.7)
  });

  it('uses provided requestId when given', async () => {
    logInferenceUsage(mockPool, {
      databaseId: 'db-req',
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

    const inserts = insertCalls(mockQuery);
    expect(inserts).toHaveLength(1);
    const [, params] = inserts[0];
    expect(params[3]).toBe('req-custom-123'); // request_id
  });

  it('stores raw_usage as null when not provided', async () => {
    logInferenceUsage(mockPool, {
      databaseId: 'db-noraw',
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

    const inserts = insertCalls(mockQuery);
    expect(inserts).toHaveLength(1);
    const [, params] = inserts[0];
    expect(params[14]).toBeNull(); // raw_usage
  });
});
