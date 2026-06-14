/**
 * Integration tests for inference metering via the published agentic-server stack.
 *
 * Verifies that createBillingClient.logInference:
 *   1. INSERTs into the configured inference log table
 *   2. Captures model, provider, tokens, latency_ms, status
 *   3. Never throws — metering errors are swallowed
 *   4. Handles both chat and embed services
 *   5. Records error status with error_type for failed inferences
 *   6. Handles null optional fields gracefully
 *   7. Stores rawUsage as JSON
 *   8. Is a no-op when inferenceLog config is null
 *   9. Passes latencyMs correctly
 *  10. Includes cache and RAG fields
 */

import { createBillingClient } from '@constructive-io/express-context';

const flush = () => new Promise((r) => setTimeout(r, 20));

describe('logInference (via createBillingClient)', () => {
  let mockQuery: jest.Mock;
  let mockWithPgClient: any;

  const inferenceLogConfig = {
    schema: 'constructive_usage_public',
    tableName: 'platform_usage_log_inferences'
  };

  beforeEach(() => {
    mockQuery = jest.fn().mockResolvedValue({ rows: [] });
    mockWithPgClient = async (fn: any) => fn({ query: mockQuery });
  });

  it('inserts into the configured inference log table', async () => {
    const billing = createBillingClient(mockWithPgClient, 'entity-001', null, inferenceLogConfig);
    await billing.logInference({
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

    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [sql] = mockQuery.mock.calls[0];
    expect(sql).toContain('INSERT INTO');
    expect(sql).toContain('platform_usage_log_inferences');
  });

  it('passes correct columns for chat completions', async () => {
    const billing = createBillingClient(mockWithPgClient, 'entity-bbb', null, inferenceLogConfig);
    await billing.logInference({
      entityId: 'entity-bbb',
      actorId: 'actor-ccc',
      model: 'gpt-4o',
      provider: 'openai',
      service: 'chat',
      operation: 'chat/completions',
      inputTokens: 200,
      outputTokens: 80,
      totalTokens: 280,
      latencyMs: 450,
      status: 'ok',
      rawUsage: { prompt_tokens: 200, completion_tokens: 80, total_tokens: 280 }
    });

    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain('model');
    expect(sql).toContain('provider');
    expect(sql).toContain('input_tokens');
    expect(sql).toContain('output_tokens');
    expect(sql).toContain('total_tokens');
    expect(sql).toContain('latency_ms');

    // params: [entity_id, actor_id, model, provider, service, operation,
    //          input_tokens, output_tokens, total_tokens, latency_ms, status,
    //          cache_read_tokens, cache_write_tokens, rag_enabled, chunks_retrieved,
    //          embedding_model, embedding_latency_ms, error_type, raw_usage]
    expect(params).toContain('entity-bbb');
    expect(params).toContain('actor-ccc');
    expect(params).toContain('gpt-4o');
    expect(params).toContain('openai');
    expect(params).toContain('chat');
    expect(params).toContain('chat/completions');
    expect(params).toContain(200);      // input_tokens
    expect(params).toContain(80);       // output_tokens
    expect(params).toContain(280);      // total_tokens
    expect(params).toContain(450);      // latency_ms
    expect(params).toContain('ok');     // status
  });

  it('logs embed service correctly', async () => {
    const billing = createBillingClient(mockWithPgClient, 'entity-embed', null, inferenceLogConfig);
    await billing.logInference({
      entityId: 'entity-embed',
      actorId: null,
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

    const [, params] = mockQuery.mock.calls[0];
    expect(params).toContain('text-embedding-3-small');
    expect(params).toContain('embed');
    expect(params).toContain('embeddings');
    expect(params).toContain(50);   // input_tokens
  });

  it('records error status with error_type', async () => {
    const billing = createBillingClient(mockWithPgClient, 'entity-err', null, inferenceLogConfig);
    await billing.logInference({
      entityId: 'entity-err',
      actorId: null,
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

    const [, params] = mockQuery.mock.calls[0];
    expect(params).toContain('error');
    expect(params).toContain('upstream_429');
  });

  it('handles null optional fields gracefully', async () => {
    const billing = createBillingClient(mockWithPgClient, 'entity-null', null, inferenceLogConfig);
    await billing.logInference({
      entityId: 'entity-null',
      actorId: null,
      model: 'llama3',
      provider: null,
      service: 'chat',
      operation: 'chat/completions',
      inputTokens: 10,
      outputTokens: 20,
      totalTokens: 30,
      latencyMs: 5,
      status: 'ok'
    });

    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [, params] = mockQuery.mock.calls[0];
    expect(params).toContain(null); // actor_id or provider is null
  });

  it('never throws even when withPgClient rejects', async () => {
    const failingClient = async () => { throw new Error('connection refused'); };
    const billing = createBillingClient(failingClient as any, 'entity-x', null, inferenceLogConfig);

    await expect(billing.logInference({
      entityId: 'entity-x',
      actorId: null,
      model: 'gpt-4o',
      provider: 'openai',
      service: 'chat',
      operation: 'chat/completions',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      latencyMs: 0,
      status: 'ok'
    })).resolves.toBeUndefined();
  });

  it('stores rawUsage as JSON string', async () => {
    const billing = createBillingClient(mockWithPgClient, 'entity-raw', null, inferenceLogConfig);
    const rawUsage = { prompt_tokens: 200, completion_tokens: 80, total_tokens: 280 };
    await billing.logInference({
      entityId: 'entity-raw',
      actorId: null,
      model: 'gpt-4o',
      provider: 'openai',
      service: 'chat',
      operation: 'chat/completions',
      inputTokens: 200,
      outputTokens: 80,
      totalTokens: 280,
      latencyMs: 100,
      status: 'ok',
      rawUsage
    });

    const [, params] = mockQuery.mock.calls[0];
    const jsonParam = params.find((p: any) => typeof p === 'string' && p.includes('prompt_tokens'));
    expect(JSON.parse(jsonParam)).toEqual(rawUsage);
  });

  it('is a no-op when inferenceLog config is null', async () => {
    const billing = createBillingClient(mockWithPgClient, 'entity-noop', null, null);
    await billing.logInference({
      entityId: 'entity-noop',
      actorId: null,
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

    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('passes latencyMs correctly', async () => {
    const billing = createBillingClient(mockWithPgClient, 'entity-lat', null, inferenceLogConfig);
    await billing.logInference({
      entityId: 'entity-lat',
      actorId: null,
      model: 'gpt-4o',
      provider: 'openai',
      service: 'chat',
      operation: 'chat/completions',
      inputTokens: 10,
      outputTokens: 5,
      totalTokens: 15,
      latencyMs: 320,
      status: 'ok'
    });

    const [, params] = mockQuery.mock.calls[0];
    expect(params).toContain(320);
  });

  it('includes cache and RAG fields when provided', async () => {
    const billing = createBillingClient(mockWithPgClient, 'entity-rag', null, inferenceLogConfig);
    await billing.logInference({
      entityId: 'entity-rag',
      actorId: 'actor-rag',
      model: 'gpt-4o',
      provider: 'openai',
      service: 'chat',
      operation: 'chat/completions',
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
      latencyMs: 200,
      status: 'ok',
      cacheReadTokens: 30,
      cacheWriteTokens: 20,
      ragEnabled: true,
      chunksRetrieved: 5,
      embeddingModel: 'text-embedding-3-small',
      embeddingLatencyMs: 45
    });

    const [, params] = mockQuery.mock.calls[0];
    expect(params).toContain(30);    // cacheReadTokens
    expect(params).toContain(20);    // cacheWriteTokens
    expect(params).toContain(true);  // ragEnabled
    expect(params).toContain(5);     // chunksRetrieved
    expect(params).toContain('text-embedding-3-small'); // embeddingModel
    expect(params).toContain(45);    // embeddingLatencyMs
  });
});
