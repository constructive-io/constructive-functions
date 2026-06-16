/**
 * Integration tests for storage metering (fire-and-forget usage logging).
 *
 * Verifies that logStorageUsage:
 *   1. Resolves table names via ModuleLoader (metaschema query)
 *   2. INSERTs into the resolved compute_log table with correct columns
 *   3. Never throws — metering errors are swallowed
 *   4. Captures operation, bucket, key, size_bytes, duration_ms
 *   5. Rounds duration_ms to nearest integer
 *   6. Works for read, write, and delete operations
 */

import { logStorageUsage } from '../../job/worker/src/storage-meter';
import { createModuleMockQuery, MODULE_CONFIGS } from './helpers/module-mock';

/** Wait for fire-and-forget promises to settle */
const flush = () => new Promise((r) => setTimeout(r, 30));

/** Filter query calls to only INSERT statements for the compute_log table */
function storageInserts(mockQuery: jest.Mock) {
  return mockQuery.mock.calls.filter(
    ([sql]: [string]) =>
      sql.includes('INSERT INTO') &&
      sql.includes(MODULE_CONFIGS.computeLog.compute_log_table_name)
  );
}

describe('logStorageUsage', () => {
  let mockQuery: jest.Mock;
  let mockPool: any;

  beforeEach(() => {
    mockQuery = createModuleMockQuery();
    mockPool = { query: mockQuery } as any;
  });

  it('resolves table names from MetaSchema and inserts', async () => {
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

    // 1 metaschema lookup + 1 INSERT
    expect(mockQuery).toHaveBeenCalledTimes(2);

    const inserts = storageInserts(mockQuery);
    expect(inserts).toHaveLength(1);
    const [sql] = inserts[0];
    expect(sql).toContain('INSERT INTO');
    expect(sql).toContain(MODULE_CONFIGS.computeLog.compute_log_table_name);
  });

  it('resolves table names from MetaSchema before INSERT', async () => {
    logStorageUsage(mockPool, {
      databaseId: 'db-meta',
      operation: 'read',
      bucket: 'b',
      key: 'k',
      sizeBytes: 1,
      durationMs: 1
    });
    await flush();

    const metaCalls = mockQuery.mock.calls.filter(
      ([sql]: [string]) => sql.includes('compute_log_module')
    );
    expect(metaCalls.length).toBeGreaterThanOrEqual(1);
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

    const inserts = storageInserts(mockQuery);
    expect(inserts).toHaveLength(1);
    const [sql, params] = inserts[0];
    expect(sql).toContain('database_id');
    expect(sql).toContain('entity_id');
    expect(sql).toContain('actor_id');
    expect(sql).toContain('operation');
    expect(sql).toContain('bucket');
    expect(sql).toContain('key');
    expect(sql).toContain('size_bytes');
    expect(sql).toContain('duration_ms');

    // params: [database_id, entity_id, actor_id, operation, bucket, key, size_bytes, duration_ms]
    expect(params[0]).toBe('db-aaa');          // database_id
    expect(params[1]).toBe('entity-bbb');      // entity_id
    expect(params[2]).toBe('actor-ccc');       // actor_id
    expect(params[3]).toBe('read');            // operation
    expect(params[4]).toBe('assets');          // bucket
    expect(params[5]).toBe('images/logo.png'); // key
    expect(params[6]).toBe(2048);             // size_bytes
    expect(params[7]).toBe(15);               // duration_ms (rounded)
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

    const inserts = storageInserts(mockQuery);
    expect(inserts).toHaveLength(1);
    const [, params] = inserts[0];
    expect(params[3]).toBe('write');           // operation
    expect(params[4]).toBe('uploads');         // bucket
    expect(params[5]).toBe('docs/report.pdf'); // key
    expect(params[6]).toBe(1048576);           // size_bytes (1MB)
    expect(params[7]).toBe(200);              // duration_ms
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

    const inserts = storageInserts(mockQuery);
    expect(inserts).toHaveLength(1);
    const [, params] = inserts[0];
    expect(params[3]).toBe('delete');                 // operation
    expect(params[4]).toBe('temp');                    // bucket
    expect(params[5]).toBe('scratch/old-file.tmp');   // key
    expect(params[6]).toBe(0);                        // size_bytes
  });

  it('handles null entity_id, actor_id gracefully', async () => {
    logStorageUsage(mockPool, {
      databaseId: 'db-null',
      operation: 'read',
      bucket: 'public',
      key: 'data.json',
      sizeBytes: 512,
      durationMs: 3
    });
    await flush();

    const inserts = storageInserts(mockQuery);
    expect(inserts).toHaveLength(1);
    const [, params] = inserts[0];
    expect(params[0]).toBe('db-null');  // database_id (always provided)
    expect(params[1]).toBeNull();       // entity_id
    expect(params[2]).toBeNull();       // actor_id
  });

  it('never throws even when pool.query rejects', async () => {
    mockQuery.mockRejectedValue(new Error('connection refused'));

    expect(() => {
      logStorageUsage(mockPool, {
        databaseId: 'db-fail',
        operation: 'write',
        bucket: 'test',
        key: 'test.txt',
        sizeBytes: 100,
        durationMs: 1
      });
    }).not.toThrow();

    await flush();
  });

  it('rounds duration_ms to nearest integer', async () => {
    logStorageUsage(mockPool, {
      databaseId: 'db-round',
      operation: 'read',
      bucket: 'data',
      key: 'file.bin',
      sizeBytes: 256,
      durationMs: 3.7
    });
    await flush();

    const inserts = storageInserts(mockQuery);
    expect(inserts).toHaveLength(1);
    const [, params] = inserts[0];
    expect(params[7]).toBe(4); // Math.round(3.7)
  });
});
