/**
 * E2E tests for delete-s3-object handler.
 *
 * Requires: Postgres on :5432, MinIO on :9000 (docker compose up -d)
 * Run: npx jest --runInBand functions/delete-s3-object
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Client as PgClient } from 'pg';

import handler from '../handler';
import { createMockContext } from '../../../tests/helpers/mock-context';
import {
  makePgClient,
  setupObjectStoreSchema,
  teardownObjectStoreSchema,
  cleanObjectStoreRows,
} from '../../../tests/helpers/object-store-schema';

// ---------------------------------------------------------------------------
// Infra helpers
// ---------------------------------------------------------------------------

const SCHEMA = 'object_store_public';
const BUCKET = 'test-bucket';

const ENV: Record<string, string> = {
  PGHOST: 'localhost',
  PGPORT: '5432',
  PGUSER: 'postgres',
  PGPASSWORD: 'password',
  PGDATABASE: 'constructive',
  AWS_REGION: 'us-east-1',
  AWS_ACCESS_KEY_ID: 'minioadmin',
  AWS_SECRET_ACCESS_KEY: 'minioadmin',
  S3_ENDPOINT: 'http://localhost:9000',
  S3_BUCKET: BUCKET,
};

function makeS3(): S3Client {
  return new S3Client({
    region: 'us-east-1',
    credentials: { accessKeyId: 'minioadmin', secretAccessKey: 'minioadmin' },
    endpoint: 'http://localhost:9000',
    forcePathStyle: true,
  });
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('delete-s3-object handler e2e', () => {
  let pg: PgClient;
  let s3: S3Client;
  const s3Keys: string[] = [];

  beforeAll(async () => {
    pg = makePgClient();
    await pg.connect();
    s3 = makeS3();
    await setupObjectStoreSchema(pg);
  });

  afterAll(async () => {
    for (const key of s3Keys) {
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
      } catch { /* ignore */ }
    }
    await teardownObjectStoreSchema(pg);
    await pg.end();
    s3.destroy();
    try {
      const pgCache = require('pg-cache');
      if (pgCache.close) await pgCache.close();
    } catch { /* ignore */ }
  });

  afterEach(async () => {
    await cleanObjectStoreRows(pg);
  });

  function callHandler(file_id: string, database_id: number, key: string) {
    const ctx = createMockContext({ env: ENV });
    return handler({ file_id, database_id, key }, ctx as any);
  }

  async function insertFile(opts: {
    s3Key: string;
    body: Buffer;
    status?: string;
    databaseId?: number;
  }): Promise<{ id: string; database_id: number }> {
    const databaseId = opts.databaseId ?? 1;
    s3Keys.push(opts.s3Key);

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: opts.s3Key,
      Body: opts.body,
      ContentType: 'application/octet-stream',
    }));

    const res = await pg.query(
      `INSERT INTO ${SCHEMA}.files
         (database_id, key, bucket_key, status)
       VALUES ($1, $2, 'default', $3::${SCHEMA}.file_status)
       RETURNING id, database_id`,
      [databaseId, opts.s3Key, opts.status ?? 'deleting']
    );
    return res.rows[0];
  }

  async function s3ObjectExists(key: string): Promise<boolean> {
    try {
      await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
      return true;
    } catch (err: any) {
      if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw err;
    }
  }

  // -----------------------------------------------------------------------
  // Test 1: Happy path — deletes S3 object and DB row
  // -----------------------------------------------------------------------

  it('deletes S3 object and DB row successfully', async () => {
    const key = `e2e-del-${Date.now()}-test.bin`;
    const body = Buffer.from('test file content');

    const { id, database_id } = await insertFile({
      s3Key: key,
      body,
      status: 'deleting',
    });

    expect(await s3ObjectExists(key)).toBe(true);

    const result: any = await callHandler(id, database_id, key);

    expect(result.success).toBe(true);
    expect(result.key).toBe(key);
    expect(await s3ObjectExists(key)).toBe(false);

    const dbRes = await pg.query(
      `SELECT * FROM ${SCHEMA}.files WHERE id = $1 AND database_id = $2`,
      [id, database_id]
    );
    expect(dbRes.rows.length).toBe(0);
  });

  // -----------------------------------------------------------------------
  // Test 2: Idempotency — S3 object already deleted
  // -----------------------------------------------------------------------

  it('succeeds when S3 object already deleted (idempotent)', async () => {
    const key = `e2e-del-gone-${Date.now()}-test.bin`;

    const res = await pg.query(
      `INSERT INTO ${SCHEMA}.files
         (database_id, key, bucket_key, status)
       VALUES (1, $1, 'default', 'deleting')
       RETURNING id, database_id`,
      [key]
    );
    const { id, database_id } = res.rows[0];

    const result: any = await callHandler(id, database_id, key);

    expect(result.success).toBe(true);

    const dbRes = await pg.query(
      `SELECT * FROM ${SCHEMA}.files WHERE id = $1 AND database_id = $2`,
      [id, database_id]
    );
    expect(dbRes.rows.length).toBe(0);
  });

  // -----------------------------------------------------------------------
  // Test 3: Idempotency — DB row already deleted
  // -----------------------------------------------------------------------

  it('succeeds when DB row already deleted (idempotent)', async () => {
    const key = `e2e-del-norow-${Date.now()}-test.bin`;

    s3Keys.push(key);
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: Buffer.from('orphan'),
      ContentType: 'application/octet-stream',
    }));

    const result: any = await callHandler(
      '00000000-0000-0000-0000-000000000000',
      1,
      key
    );

    expect(result.success).toBe(true);
    expect(await s3ObjectExists(key)).toBe(false);
  });

  // -----------------------------------------------------------------------
  // Test 4: Both already deleted — fully idempotent
  // -----------------------------------------------------------------------

  it('succeeds when both S3 and DB are already gone', async () => {
    const result: any = await callHandler(
      '00000000-0000-0000-0000-000000000000',
      999,
      `nonexistent-key-${Date.now()}`
    );

    expect(result.success).toBe(true);
  });
});
