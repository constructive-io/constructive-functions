import {
  DeleteObjectCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';
import { Client as PgClient } from 'pg';
import { Readable } from 'stream';

import handler from '../handler';
import {
  cleanFilesStoreRows,
  makePgClient,
  setupFilesStoreSchema,
  teardownFilesStoreSchema,
} from '../../../tests/helpers/object-store-schema';

jest.setTimeout(60000);

jest.mock('@constructive-io/graphql-env', () => ({
  getEnvOptions: () => ({
    cdn: {
      provider: process.env.BUCKET_PROVIDER || 'minio',
      bucketName: process.env.BUCKET_NAME || 'test-bucket',
      awsRegion: process.env.AWS_REGION || 'us-east-1',
      awsAccessKey: process.env.AWS_ACCESS_KEY || 'minioadmin',
      awsSecretKey: process.env.AWS_SECRET_KEY || 'minioadmin',
      minioEndpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
    },
  }),
}), { virtual: true });

const OBJECT_STORE_SCHEMA = 'files_store_public';
const SOURCE_SCHEMA = 'public';
const SOURCE_TABLE = 'test_upload_flow_images';
const SOURCE_COLUMN = 'image';
const BUCKET = 'test-bucket';
const USER_ID = 'aaaaaaaa-0000-0000-0000-000000000001';
const DATABASE_ID = 1;
const LARGE_JPEG = readFileSync(
  path.resolve(
    __dirname,
    '../../../../constructive/uploads/etag-stream/__fixtures__/deadman.jpg',
  ),
);

type UploadResolverModule = typeof import('../../../../constructive/graphile/graphile-settings/src/upload-resolver');

type UploadResult = {
  key?: string;
  url: string;
  mime: string;
  filename: string;
};

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

function makeContext(envOverrides: Record<string, string> = {}) {
  return {
    log: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
    env: {
      ...ENV,
      ...envOverrides,
    },
  } as any;
}

function makeUpload(filename: string, body: Buffer) {
  return {
    filename,
    createReadStream: () => Readable.from(body),
  };
}

async function objectExists(s3: S3Client, key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function loadUploadResolverModule(): Promise<UploadResolverModule> {
  jest.resetModules();
  return import('../../../../constructive/graphile/graphile-settings/src/upload-resolver');
}

describe('upload to process-image flow e2e', () => {
  let pg: PgClient;
  let s3: S3Client;
  let uploadResolverModule: UploadResolverModule | null = null;
  const originalEnv = { ...process.env };

  beforeAll(async () => {
    process.env.UPLOAD_V2_ENABLED = 'true';
    process.env.BUCKET_PROVIDER = ENV.BUCKET_PROVIDER;
    process.env.BUCKET_NAME = ENV.BUCKET_NAME;
    process.env.AWS_REGION = ENV.AWS_REGION;
    process.env.AWS_ACCESS_KEY = ENV.AWS_ACCESS_KEY;
    process.env.AWS_SECRET_KEY = ENV.AWS_SECRET_KEY;
    process.env.MINIO_ENDPOINT = ENV.MINIO_ENDPOINT;
    process.env.PGHOST = ENV.PGHOST;
    process.env.PGPORT = ENV.PGPORT;
    process.env.PGUSER = ENV.PGUSER;
    process.env.PGPASSWORD = ENV.PGPASSWORD;
    process.env.PGDATABASE = ENV.PGDATABASE;

    pg = makePgClient();
    await pg.connect();
    s3 = makeS3();

    await setupFilesStoreSchema(pg);
    await pg.query(`
      CREATE TABLE IF NOT EXISTS ${SOURCE_SCHEMA}.${SOURCE_TABLE} (
        id uuid PRIMARY KEY,
        ${SOURCE_COLUMN} jsonb
      )
    `);
    await pg.query(`
      DROP TRIGGER IF EXISTS ${SOURCE_TABLE}_${SOURCE_COLUMN}_file_ref
        ON ${SOURCE_SCHEMA}.${SOURCE_TABLE}
    `);
    await pg.query(`
      CREATE TRIGGER ${SOURCE_TABLE}_${SOURCE_COLUMN}_file_ref
        AFTER UPDATE OF ${SOURCE_COLUMN} ON ${SOURCE_SCHEMA}.${SOURCE_TABLE}
        FOR EACH ROW
        EXECUTE FUNCTION ${OBJECT_STORE_SCHEMA}.populate_file_back_reference(
          '${SOURCE_COLUMN}',
          '${SOURCE_SCHEMA}.${SOURCE_TABLE}'
        )
    `);
  });

  afterEach(async () => {
    if (uploadResolverModule) {
      await uploadResolverModule.__resetUploadResolverForTests();
      uploadResolverModule = null;
    }

    const keysResult = await pg.query(
      `SELECT key FROM ${OBJECT_STORE_SCHEMA}.files ORDER BY key`
    );
    for (const row of keysResult.rows) {
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: row.key }));
      } catch {
        // ignore cleanup failures for already-deleted objects
      }
    }

    await pg.query(`DELETE FROM ${SOURCE_SCHEMA}.${SOURCE_TABLE}`);
    await cleanFilesStoreRows(pg);
  });

  afterAll(async () => {
    process.env = originalEnv;

    await pg.query(
      `DROP TABLE IF EXISTS ${SOURCE_SCHEMA}.${SOURCE_TABLE} CASCADE`
    );
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

  async function insertSourceRow(id: string): Promise<void> {
    await pg.query(
      `INSERT INTO ${SOURCE_SCHEMA}.${SOURCE_TABLE} (id, ${SOURCE_COLUMN})
       VALUES ($1, NULL)`,
      [id]
    );
  }

  async function attachUploadToSourceRow(sourceId: string, upload: UploadResult): Promise<void> {
    await pg.query('BEGIN');
    try {
      await pg.query(`SELECT set_config('app.database_id', $1, true)`, [
        String(DATABASE_ID),
      ]);
      await pg.query(
        `UPDATE ${SOURCE_SCHEMA}.${SOURCE_TABLE}
            SET ${SOURCE_COLUMN} = $2::jsonb
          WHERE id = $1`,
        [sourceId, JSON.stringify(upload)]
      );
      await pg.query('COMMIT');
    } catch (err) {
      await pg.query('ROLLBACK');
      throw err;
    }
  }

  async function getFileRowByKey(key: string) {
    const result = await pg.query(
      `SELECT id, database_id, key, status, source_table, source_column, source_id
         FROM ${OBJECT_STORE_SCHEMA}.files
        WHERE key = $1`,
      [key]
    );
    if (result.rowCount !== 1) {
      throw new Error(`Expected one file row for key=${key}, got ${result.rowCount}`);
    }
    return result.rows[0];
  }

  async function runProcessImage(fileId: string) {
    return handler(
      { file_id: fileId, database_id: DATABASE_ID },
      makeContext(),
    ) as Promise<any>;
  }

  async function expectProcessedFlow(upload: UploadResult): Promise<void> {
    if (!upload.key) {
      throw new Error('Expected upload result to include a durable key');
    }

    const sourceId = randomUUID();
    await insertSourceRow(sourceId);
    await attachUploadToSourceRow(sourceId, upload);

    const fileRow = await getFileRowByKey(upload.key);
    expect(fileRow).toEqual(
      expect.objectContaining({
        database_id: DATABASE_ID,
        key: upload.key,
        status: 'pending',
        source_table: `${SOURCE_SCHEMA}.${SOURCE_TABLE}`,
        source_column: SOURCE_COLUMN,
        source_id: sourceId,
      })
    );

    const result = await runProcessImage(fileRow.id);
    expect(result).toEqual({ success: true, versions: 2 });

    const baseKey = upload.key.replace(/_origin$/, '');
    const thumbnailKey = `${baseKey}_thumbnail`;
    const mediumKey = `${baseKey}_medium`;

    expect(await objectExists(s3, upload.key)).toBe(true);
    expect(await objectExists(s3, thumbnailKey)).toBe(true);
    expect(await objectExists(s3, mediumKey)).toBe(true);

    const files = await pg.query(
      `SELECT key, status, source_table, source_column, source_id
         FROM ${OBJECT_STORE_SCHEMA}.files
        WHERE key LIKE $1
        ORDER BY key`,
      [`${baseKey}%`]
    );

    expect(files.rows).toEqual([
      {
        key: mediumKey,
        status: 'ready',
        source_table: `${SOURCE_SCHEMA}.${SOURCE_TABLE}`,
        source_column: SOURCE_COLUMN,
        source_id: sourceId,
      },
      {
        key: upload.key,
        status: 'ready',
        source_table: `${SOURCE_SCHEMA}.${SOURCE_TABLE}`,
        source_column: SOURCE_COLUMN,
        source_id: sourceId,
      },
      {
        key: thumbnailKey,
        status: 'ready',
        source_table: `${SOURCE_SCHEMA}.${SOURCE_TABLE}`,
        source_column: SOURCE_COLUMN,
        source_id: sourceId,
      },
    ]);

    const sourceResult = await pg.query(
      `SELECT ${SOURCE_COLUMN}
         FROM ${SOURCE_SCHEMA}.${SOURCE_TABLE}
        WHERE id = $1`,
      [sourceId]
    );
    const imageValue = sourceResult.rows[0][SOURCE_COLUMN];

    expect(imageValue).toEqual(
      expect.objectContaining({
        key: upload.key,
        filename: upload.filename,
        mime: upload.mime,
      })
    );
    expect(imageValue.versions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: thumbnailKey,
          mime: 'image/jpeg',
          width: 150,
          height: 150,
        }),
        expect.objectContaining({
          key: mediumKey,
          mime: 'image/jpeg',
          width: 1200,
        }),
      ])
    );
    expect(imageValue.versions).toHaveLength(2);

    const secondRun = await runProcessImage(fileRow.id);
    expect(secondRun).toEqual({ skipped: true, reason: 'not_pending_or_locked' });
  }

  it('covers REST-style upload through processed versions', async () => {
    uploadResolverModule = await loadUploadResolverModule();

    const upload = await uploadResolverModule.streamToStorage(
      Readable.from(LARGE_JPEG),
      'rest-flow.jpg',
      {
        databaseId: String(DATABASE_ID),
        userId: USER_ID,
        bucketKey: 'default',
      }
    );

    expect(upload).toEqual(
      expect.objectContaining({
        key: expect.stringMatching(/^1\/default\/[0-9a-f-]+_origin$/),
        filename: 'rest-flow.jpg',
        mime: 'image/jpeg',
        url: expect.any(String),
      })
    );

    await expectProcessedFlow(upload);
  });

  it('covers inline GraphQL upload through processed versions', async () => {
    uploadResolverModule = await loadUploadResolverModule();

    const imageUploadDefinition = uploadResolverModule.constructiveUploadFieldDefinitions.find(
      (definition) => 'name' in definition && definition.name === 'image'
    );

    if (!imageUploadDefinition) {
      throw new Error('Missing image upload definition');
    }

    const upload = await imageUploadDefinition.resolve(
      makeUpload('inline-flow.jpg', LARGE_JPEG) as any,
      {},
      {
        req: {
          api: { databaseId: String(DATABASE_ID) },
          token: { user_id: USER_ID },
        },
      },
      { uploadPlugin: { tags: {}, type: 'image' } } as any
    ) as UploadResult;

    expect(upload).toEqual(
      expect.objectContaining({
        key: expect.stringMatching(/^1\/default\/[0-9a-f-]+_origin$/),
        filename: 'inline-flow.jpg',
        mime: 'image/jpeg',
        url: expect.any(String),
      })
    );

    await expectProcessedFlow(upload);
  });
});
