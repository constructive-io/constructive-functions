/**
 * Integration tests for storage metering (fire-and-forget usage logging).
 *
 * Verifies that logStorageUsage:
 *   1. INSERTs into platform_usage_log_storage with correct columns
 *   2. Captures operation, bucket, key, size_bytes, duration_ms
 *   3. Never throws — metering errors are swallowed
 *   4. Handles null database_id, entity_id, actor_id gracefully
 *   5. Rounds duration_ms to nearest integer
 *   6. Works for read, write, and delete operations
 */

import { logStorageUsage } from '../../job/worker/src/storage-meter';

/** Wait for fire-and-forget promises to settle */
const flush = () => new Promise((r) => setTimeout(r, 20));

describe('logStorageUsage', () => {
  let mockQuery: jest.Mock;
  let mockPool: any;

  beforeEach(() => {
    mockQuery = jest.fn().mockResolvedValue({ rows: [] });
    mockPool = { query: mockQuery } as any;
  });

  it('inserts into platform_usage_log_storage', async () => {
    logStorageUsage(mockPool, {
      databaseId: 'db-001',
      entityId: 'entity-001',
      actorId: 'actor-001',
      operation: 'read',
      bucket: 'my-bucket',
      key: 'path/to/file.txt',
      sizeBytes: 1024,
      durationMs: 50
    });
    await flush();

    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [sql] = mockQuery.mock.calls[0];
    expect(sql).toContain('INSERT INTO');
    expect(sql).toContain('platform_usage_log_storage');
  });

  it('passes correct columns for a read operation', async () => {
    logStorageUsage(mockPool, {
      databaseId: 'db-aaa',
      entityId: 'entity-bbb',
      actorId: 'actor-ccc',
      operation: 'read',
      bucket: 'assets',
      key: 'images/logo.png',
      sizeBytes: 2048,
      durationMs: 15.3
    });
    await flush();

    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain('database_id');
    expect(sql).toContain('entity_id');
    expect(sql).toContain('actor_id');
    expect(sql).toContain('operation');
    expect(sql).toContain('bucket');
    expect(sql).toContain('key');
    expect(sql).toContain('size_bytes');
    expect(sql).toContain('duration_ms');

    // params: [id, database_id, entity_id, actor_id, operation,
    //          bucket, key, size_bytes, duration_ms, created_at]
    expect(params[0]).toBeDefined();           // id (UUID)
    expect(params[1]).toBe('db-aaa');          // database_id
    expect(params[2]).toBe('entity-bbb');      // entity_id
    expect(params[3]).toBe('actor-ccc');       // actor_id
    expect(params[4]).toBe('read');            // operation
    expect(params[5]).toBe('assets');          // bucket
    expect(params[6]).toBe('images/logo.png'); // key
    expect(params[7]).toBe(2048);             // size_bytes
    expect(params[8]).toBe(15);               // duration_ms (rounded)
    expect(params[9]).toBeInstanceOf(Date);    // created_at
  });

  it('logs write operations correctly', async () => {
    logStorageUsage(mockPool, {
      databaseId: 'db-write',
      entityId: 'entity-write',
      actorId: 'actor-write',
      operation: 'write',
      bucket: 'uploads',
      key: 'docs/report.pdf',
      sizeBytes: 1048576,
      durationMs: 200
    });
    await flush();

    const [, params] = mockQuery.mock.calls[0];
    expect(params[4]).toBe('write');           // operation
    expect(params[5]).toBe('uploads');         // bucket
    expect(params[6]).toBe('docs/report.pdf'); // key
    expect(params[7]).toBe(1048576);           // size_bytes (1MB)
    expect(params[8]).toBe(200);              // duration_ms
  });

  it('logs delete operations correctly', async () => {
    logStorageUsage(mockPool, {
      databaseId: 'db-del',
      operation: 'delete',
      bucket: 'temp',
      key: 'scratch/old-file.tmp',
      sizeBytes: 0,
      durationMs: 5
    });
    await flush();

    const [, params] = mockQuery.mock.calls[0];
    expect(params[4]).toBe('delete');                 // operation
    expect(params[5]).toBe('temp');                    // bucket
    expect(params[6]).toBe('scratch/old-file.tmp');   // key
    expect(params[7]).toBe(0);                        // size_bytes
  });

  it('handles null database_id, entity_id, actor_id gracefully', async () => {
    logStorageUsage(mockPool, {
      operation: 'read',
      bucket: 'public',
      key: 'data.json',
      sizeBytes: 512,
      durationMs: 3
    });
    await flush();

    expect(mockQuery).toHaveBeenCalledTimes(1);

    const [, params] = mockQuery.mock.calls[0];
    expect(params[1]).toBeNull(); // database_id
    expect(params[2]).toBeNull(); // entity_id
    expect(params[3]).toBeNull(); // actor_id
  });

  it('never throws even when pool.query rejects', async () => {
    mockQuery.mockRejectedValue(new Error('connection refused'));

    expect(() => {
      logStorageUsage(mockPool, {
        operation: 'write',
        bucket: 'test',
        key: 'test.txt',
        sizeBytes: 100,
        durationMs: 1
      });
    }).not.toThrow();

    await flush();
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('rounds duration_ms to nearest integer', async () => {
    logStorageUsage(mockPool, {
      operation: 'read',
      bucket: 'data',
      key: 'file.bin',
      sizeBytes: 256,
      durationMs: 3.7
    });
    await flush();

    const [, params] = mockQuery.mock.calls[0];
    expect(params[8]).toBe(4); // Math.round(3.7)
  });

  it('generates a unique UUID for each log entry', async () => {
    logStorageUsage(mockPool, {
      operation: 'read',
      bucket: 'b1',
      key: 'k1',
      sizeBytes: 10,
      durationMs: 1
    });
    logStorageUsage(mockPool, {
      operation: 'write',
      bucket: 'b2',
      key: 'k2',
      sizeBytes: 20,
      durationMs: 2
    });
    await flush();

    expect(mockQuery).toHaveBeenCalledTimes(2);
    const id1 = mockQuery.mock.calls[0][1][0];
    const id2 = mockQuery.mock.calls[1][1][0];
    expect(id1).not.toBe(id2);
  });
});
