import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { Client as PgClient } from 'pg';
import sharp from 'sharp';

import handler from '../handler';
import { createMockContext } from '../../../tests/helpers/mock-context';
import {
  cleanFilesStoreRows,
  makePgClient,
  setupFilesStoreSchema,
  teardownFilesStoreSchema,
} from '../../../tests/helpers/object-store-schema';

jest.setTimeout(60000);

const OBJECT_STORE_SCHEMA = 'files_store_public';
const SOURCE_SCHEMA = 'public';
const SOURCE_TABLE = 'test_process_file_uploads';
const BUCKET = 'test-bucket';
const USER_ID = 'aaaaaaaa-0000-0000-0000-000000000001';

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

async function generateTestImage(width: number, height: number): Promise<Buffer> {
  const raw = Buffer.alloc(width * height * 3, 0);

  for (let i = 0; i < raw.length; i += 3) {
    raw[i] = (i / 3) % 256;
    raw[i + 1] = ((i / 3) >> 8) % 256;
    raw[i + 2] = 96;
  }

  return sharp(raw, { raw: { width, height, channels: 3 } })
    .jpeg()
    .toBuffer();
}

async function objectExists(s3: S3Client, key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

describe('process-image handler file mode e2e', () => {
  let pg: PgClient;
  let s3: S3Client;
  const s3Keys = new Set<string>();

  beforeAll(async () => {
    pg = makePgClient();
    await pg.connect();
    s3 = makeS3();

    await setupFilesStoreSchema(pg);
    await pg.query(`
      CREATE TABLE IF NOT EXISTS ${SOURCE_SCHEMA}.${SOURCE_TABLE} (
        id uuid PRIMARY KEY,
        image jsonb
      )
    `);
  });

  afterEach(async () => {
    for (const key of s3Keys) {
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
      } catch {
        // ignore cleanup failures for already-deleted objects
      }
    }
    s3Keys.clear();

    await pg.query(`DELETE FROM ${SOURCE_SCHEMA}.${SOURCE_TABLE}`);
    await cleanFilesStoreRows(pg);
  });

  afterAll(async () => {
    await pg.query(`DROP TABLE IF EXISTS ${SOURCE_SCHEMA}.${SOURCE_TABLE}`);
    await teardownFilesStoreSchema(pg);
    await pg.end();
    s3.destroy();

    try {
      const pgCache = require('pg-cache');
      if (pgCache.close) await pgCache.close();
      if (pgCache.teardownPgPools) await pgCache.teardownPgPools();
    } catch {
      // ignore pg-cache teardown issues in tests
    }
  });

  async function putOriginImage(key: string, body: Buffer): Promise<void> {
    s3Keys.add(key);
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: 'image/jpeg',
    }));
  }

  async function insertFileRow(opts: {
    fileId: string;
    key: string;
    sourceId?: string;
  }): Promise<void> {
    if (opts.sourceId) {
      await pg.query(
        `INSERT INTO ${OBJECT_STORE_SCHEMA}.files
           (id, database_id, bucket_key, key, status, etag, created_by,
            source_table, source_column, source_id)
         VALUES ($1, 1, 'default', $2, 'pending', 'etag-origin', $3, $4, 'image', $5)`,
        [
          opts.fileId,
          opts.key,
          USER_ID,
          `${SOURCE_SCHEMA}.${SOURCE_TABLE}`,
          opts.sourceId,
        ]
      );
      return;
    }

    await pg.query(
      `INSERT INTO ${OBJECT_STORE_SCHEMA}.files
         (id, database_id, bucket_key, key, status, etag, created_by)
       VALUES ($1, 1, 'default', $2, 'pending', 'etag-origin', $3)`,
      [opts.fileId, opts.key, USER_ID]
    );
  }

  async function callHandler(fileId: string) {
    const ctx = createMockContext({ env: ENV });
    return handler({ file_id: fileId, database_id: 1 }, ctx as any);
  }

  it('processes an attached image into ready thumbnail and medium versions', async () => {
    const fileId = randomUUID();
    const sourceId = randomUUID();
    const baseId = randomUUID();
    const originKey = `1/default/${baseId}_origin`;
    const thumbKey = `1/default/${baseId}_thumbnail`;
    const mediumKey = `1/default/${baseId}_medium`;
    const imageBuffer = await generateTestImage(1600, 900);

    await putOriginImage(originKey, imageBuffer);
    await pg.query(
      `INSERT INTO ${SOURCE_SCHEMA}.${SOURCE_TABLE} (id, image)
       VALUES ($1, $2::jsonb)`,
      [
        sourceId,
        JSON.stringify({
          key: originKey,
          mime: 'image/jpeg',
          filename: 'attached.jpg',
          url: `http://localhost:9000/${BUCKET}/${originKey}`,
        }),
      ]
    );
    await insertFileRow({ fileId, key: originKey, sourceId });

    const result: any = await callHandler(fileId);

    expect(result).toEqual({ success: true, versions: 2 });
    expect(await objectExists(s3, thumbKey)).toBe(true);
    expect(await objectExists(s3, mediumKey)).toBe(true);
    s3Keys.add(thumbKey);
    s3Keys.add(mediumKey);

    const files = await pg.query(
      `SELECT key, status, source_table, source_column, source_id
         FROM ${OBJECT_STORE_SCHEMA}.files
        WHERE key LIKE $1
        ORDER BY key`,
      [`1/default/${baseId}%`]
    );

    expect(files.rows).toEqual([
      {
        key: mediumKey,
        status: 'ready',
        source_table: `${SOURCE_SCHEMA}.${SOURCE_TABLE}`,
        source_column: 'image',
        source_id: sourceId,
      },
      {
        key: originKey,
        status: 'ready',
        source_table: `${SOURCE_SCHEMA}.${SOURCE_TABLE}`,
        source_column: 'image',
        source_id: sourceId,
      },
      {
        key: thumbKey,
        status: 'ready',
        source_table: `${SOURCE_SCHEMA}.${SOURCE_TABLE}`,
        source_column: 'image',
        source_id: sourceId,
      },
    ]);

    const sourceRow = await pg.query(
      `SELECT image FROM ${SOURCE_SCHEMA}.${SOURCE_TABLE} WHERE id = $1`,
      [sourceId]
    );
    const versions = sourceRow.rows[0].image.versions;

    expect(versions).toHaveLength(2);
    expect(versions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: thumbKey, mime: 'image/jpeg', width: 150 }),
        expect.objectContaining({ key: mediumKey, mime: 'image/jpeg', width: 1200 }),
      ])
    );

    const secondRun: any = await callHandler(fileId);
    expect(secondRun).toEqual({ skipped: true, reason: 'not_pending_or_locked' });
  });

  it('processes an unattached image without writing domain metadata', async () => {
    const fileId = randomUUID();
    const baseId = randomUUID();
    const originKey = `1/default/${baseId}_origin`;
    const thumbKey = `1/default/${baseId}_thumbnail`;
    const mediumKey = `1/default/${baseId}_medium`;
    const imageBuffer = await generateTestImage(1600, 900);

    await putOriginImage(originKey, imageBuffer);
    await insertFileRow({ fileId, key: originKey });

    const result: any = await callHandler(fileId);

    expect(result).toEqual({ success: true, versions: 2 });
    expect(await objectExists(s3, thumbKey)).toBe(true);
    expect(await objectExists(s3, mediumKey)).toBe(true);
    s3Keys.add(thumbKey);
    s3Keys.add(mediumKey);

    const files = await pg.query(
      `SELECT key, status, source_table, source_column, source_id
         FROM ${OBJECT_STORE_SCHEMA}.files
        WHERE key LIKE $1
        ORDER BY key`,
      [`1/default/${baseId}%`]
    );

    expect(files.rows).toEqual([
      {
        key: mediumKey,
        status: 'ready',
        source_table: null,
        source_column: null,
        source_id: null,
      },
      {
        key: originKey,
        status: 'ready',
        source_table: null,
        source_column: null,
        source_id: null,
      },
      {
        key: thumbKey,
        status: 'ready',
        source_table: null,
        source_column: null,
        source_id: null,
      },
    ]);
  });
});
