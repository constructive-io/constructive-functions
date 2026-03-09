/**
 * E2E tests for process-image handler.
 *
 * Requires: Postgres on :5432, MinIO on :9000 (docker compose up -d)
 * Run: pnpm test:unit -- handler.e2e
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Client as PgClient } from 'pg';
import sharp from 'sharp';

import handler from '../handler';
import { createMockContext } from '../../../tests/helpers/mock-context';

// ---------------------------------------------------------------------------
// Infra helpers
// ---------------------------------------------------------------------------

const TEST_SCHEMA = 'public';
const TEST_TABLE = 'test_process_images';
const BUCKET = 'test-bucket';

const ENV: Record<string, string> = {
  PGHOST: 'localhost',
  PGPORT: '5432',
  PGUSER: 'postgres',
  PGPASSWORD: 'password',
  PGDATABASE: 'constructive',
  BUCKET_PROVIDER: 'minio',
  BUCKET_NAME: BUCKET,
  AWS_ACCESS_KEY: 'minioadmin',
  AWS_SECRET_KEY: 'minioadmin',
  AWS_REGION: 'us-east-1',
  MINIO_ENDPOINT: 'http://localhost:9000',
};

function makeS3(): S3Client {
  return new S3Client({
    region: 'us-east-1',
    credentials: { accessKeyId: 'minioadmin', secretAccessKey: 'minioadmin' },
    endpoint: 'http://localhost:9000',
    forcePathStyle: true,
  });
}

function makePg(): PgClient {
  return new PgClient({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'constructive',
  });
}

async function generateTestImage(
  width: number,
  height: number,
  format: 'jpeg' | 'png' = 'jpeg',
): Promise<Buffer> {
  const raw = Buffer.alloc(width * height * 3, 0);
  // paint a simple gradient so it's not blank
  for (let i = 0; i < raw.length; i += 3) {
    raw[i] = (i / 3) % 256;     // R
    raw[i + 1] = ((i / 3) >> 8) % 256; // G
    raw[i + 2] = 128;           // B
  }
  return sharp(raw, { raw: { width, height, channels: 3 } })
    [format]()
    .toBuffer();
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('process-image handler e2e', () => {
  let pg: PgClient;
  let s3: S3Client;
  const s3Keys: string[] = [];

  beforeAll(async () => {
    pg = makePg();
    await pg.connect();
    s3 = makeS3();

    // Create test table
    await pg.query(`
      CREATE TABLE IF NOT EXISTS ${TEST_SCHEMA}.${TEST_TABLE} (
        id serial PRIMARY KEY,
        image jsonb
      )
    `);
  });

  afterAll(async () => {
    // Cleanup S3 objects
    for (const key of s3Keys) {
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
      } catch { /* ignore */ }
    }

    // Drop test table
    await pg.query(`DROP TABLE IF EXISTS ${TEST_SCHEMA}.${TEST_TABLE}`);
    await pg.end();
    s3.destroy();

    // Teardown pg-cache pools created by the handler
    const { teardownPgPools } = require('pg-cache');
    if (teardownPgPools) await teardownPgPools();
  });

  // Helper: upload image to MinIO and insert DB row, return row id + key
  async function setupTestRow(
    imageBuffer: Buffer,
    mime: string,
    filename: string,
  ): Promise<{ id: number; key: string }> {
    const key = `e2e-test-${Date.now()}-${filename}`;
    s3Keys.push(key);

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: imageBuffer,
      ContentType: mime,
    }));

    const url = `http://localhost:9000/${BUCKET}/${key}`;
    const imageValue = JSON.stringify({ url, mime, filename });

    const res = await pg.query(
      `INSERT INTO ${TEST_SCHEMA}.${TEST_TABLE} (image) VALUES ($1::jsonb) RETURNING id`,
      [imageValue],
    );
    return { id: res.rows[0].id, key };
  }

  function callHandler(
    id: number,
    envOverrides: Record<string, string> = {},
  ) {
    const ctx = createMockContext({ env: { ...ENV, ...envOverrides } });
    return handler(
      {
        schema: TEST_SCHEMA,
        table: TEST_TABLE,
        idFields: ['id'],
        idValues: [id],
        fields: ['image'],
      },
      ctx as any,
    );
  }

  // -----------------------------------------------------------------------
  // Test 1: Happy path — generates versions with correct MIME
  // -----------------------------------------------------------------------

  it('generates thumbnail + medium versions for an 800x600 JPEG', async () => {
    const jpegBuf = await generateTestImage(800, 600, 'jpeg');
    const { id } = await setupTestRow(jpegBuf, 'image/jpeg', 'test.jpg');

    const result: any = await callHandler(id);

    expect(result.success).toBe(true);
    const imageResult = result.results.image;
    expect(imageResult.versions).toBeDefined();
    expect(imageResult.versions.length).toBeGreaterThanOrEqual(1);

    // thumbnail should exist (800 > 150)
    const thumb = imageResult.versions.find((v: any) => v.name === 'thumbnail');
    expect(thumb).toBeDefined();
    expect(thumb.width).toBeLessThanOrEqual(150);
    expect(thumb.height).toBeLessThanOrEqual(150);

    // MIME should be derived from format, not hardcoded
    expect(thumb.mime).toBe('image/jpeg');

    // medium should exist (800 > 600)
    const medium = imageResult.versions.find((v: any) => v.name === 'medium');
    expect(medium).toBeDefined();
    expect(medium.width).toBeLessThanOrEqual(600);

    // large should NOT exist (800 < 1200)
    const large = imageResult.versions.find((v: any) => v.name === 'large');
    expect(large).toBeUndefined();

    // Track version keys for cleanup
    for (const v of imageResult.versions) {
      s3Keys.push(v.key);
    }

    // Verify DB was updated
    const dbRow = await pg.query(
      `SELECT image FROM ${TEST_SCHEMA}.${TEST_TABLE} WHERE id = $1`,
      [id],
    );
    const dbImage = dbRow.rows[0].image;
    expect(dbImage.versions.length).toBe(imageResult.versions.length);
  });

  // -----------------------------------------------------------------------
  // Test 2: Idempotency — second call skips
  // -----------------------------------------------------------------------

  it('skips processing when versions already exist', async () => {
    const jpegBuf = await generateTestImage(800, 600, 'jpeg');
    const { id } = await setupTestRow(jpegBuf, 'image/jpeg', 'idem.jpg');

    // First call: process
    await callHandler(id);

    // Second call: should skip
    const result: any = await callHandler(id);
    expect(result.success).toBe(true);
    const imageResult = result.results.image;
    expect(imageResult.skipped).toBe(true);
    expect(imageResult.reason).toBe('versions_exist');
  });

  // -----------------------------------------------------------------------
  // Test 3: File too large — MAX_IMAGE_SIZE guard
  // -----------------------------------------------------------------------

  it('skips files exceeding MAX_IMAGE_SIZE', async () => {
    const jpegBuf = await generateTestImage(400, 300, 'jpeg');
    const { id } = await setupTestRow(jpegBuf, 'image/jpeg', 'big.jpg');

    // Set MAX_IMAGE_SIZE absurdly low so even our small test image exceeds it
    const result: any = await callHandler(id, { MAX_IMAGE_SIZE: '100' });

    expect(result.success).toBe(true);
    const imageResult = result.results.image;
    expect(imageResult.skipped).toBe(true);
    expect(imageResult.reason).toBe('file_too_large');
    expect(imageResult.size).toBeGreaterThan(100);
  });

  // -----------------------------------------------------------------------
  // Test 4: MIME derivation — PNG gets image/png, not image/jpeg
  // -----------------------------------------------------------------------

  it('derives MIME from detected format (PNG → image/png)', async () => {
    const pngBuf = await generateTestImage(800, 600, 'png');
    const { id } = await setupTestRow(pngBuf, 'image/png', 'test.png');

    const result: any = await callHandler(id);

    expect(result.success).toBe(true);
    const imageResult = result.results.image;
    expect(imageResult.versions.length).toBeGreaterThanOrEqual(1);

    // All generated versions should have image/png
    for (const v of imageResult.versions) {
      expect(v.mime).toBe('image/png');
      s3Keys.push(v.key);
    }
  });

  // -----------------------------------------------------------------------
  // Test 5: MIME derivation — mismatched stored MIME corrected
  // -----------------------------------------------------------------------

  it('corrects wrong stored MIME using detected format', async () => {
    // Upload a real JPEG but store it with wrong MIME (image/png)
    const jpegBuf = await generateTestImage(800, 600, 'jpeg');
    const key = `e2e-test-${Date.now()}-wrong-mime.jpg`;
    s3Keys.push(key);

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: jpegBuf,
      ContentType: 'image/jpeg',
    }));

    const url = `http://localhost:9000/${BUCKET}/${key}`;
    // Deliberately store wrong MIME in DB
    const imageValue = JSON.stringify({ url, mime: 'image/png', filename: 'wrong-mime.jpg' });
    const res = await pg.query(
      `INSERT INTO ${TEST_SCHEMA}.${TEST_TABLE} (image) VALUES ($1::jsonb) RETURNING id`,
      [imageValue],
    );
    const id = res.rows[0].id;

    const result: any = await callHandler(id);

    expect(result.success).toBe(true);
    const imageResult = result.results.image;

    // Versions should have image/jpeg (detected), NOT image/png (stored)
    for (const v of imageResult.versions) {
      expect(v.mime).toBe('image/jpeg');
      s3Keys.push(v.key);
    }
  });

  // -----------------------------------------------------------------------
  // Test 6: Validation — missing params
  // -----------------------------------------------------------------------

  it('returns error for missing schema', async () => {
    const ctx = createMockContext({ env: ENV });
    const result: any = await handler(
      { schema: '', table: 'foo', idFields: ['id'], idValues: [1], fields: ['image'] },
      ctx as any,
    );
    expect(result.error).toMatch(/Missing/);
  });
});
