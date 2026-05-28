import type { FunctionHandler } from '@constructive-io/fn-runtime';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { Readable } from 'stream';
import pg from 'pg';

type ExtractionPayload = {
  file_id: string;
  key: string;
  mime_type: string;
  bucket_id: string;
  // Meta fields from JobTrigger (include_meta: true)
  table?: string;
  schema?: string;
};

type ExtractionMetadata = {
  pages?: number;
  language?: string;
  title?: string;
  tables?: number;
  images?: number;
  extraction_time_ms?: number;
  docling_version?: string;
};

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const createS3Client = (): S3Client => {
  const endpoint = process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT;
  const region = process.env.AWS_REGION || 'us-east-1';
  const accessKeyId = getRequiredEnv('AWS_ACCESS_KEY_ID');
  const secretAccessKey = getRequiredEnv('AWS_SECRET_ACCESS_KEY');

  return new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true
  });
};

const downloadFile = async (
  client: S3Client,
  bucket: string,
  key: string
): Promise<Buffer> => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await client.send(command);

  if (!response.Body) {
    throw new Error(`Empty response body for ${bucket}/${key}`);
  }

  const stream = response.Body as Readable;
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
};

const extractWithDocling = async (
  fileBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ markdown: string; metadata: ExtractionMetadata }> => {
  const doclingUrl = process.env.DOCLING_URL || 'http://docling-serve:5001';
  const startTime = Date.now();

  const form = new FormData();
  form.append('files', fileBuffer, {
    filename,
    contentType: mimeType
  });

  const response = await fetch(`${doclingUrl}/v1alpha/convert/file`, {
    method: 'POST',
    body: form,
    headers: form.getHeaders()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Docling extraction failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json() as {
    document?: {
      filename?: string;
      md_content?: string;
    };
    status?: string;
    processing_time?: number;
    errors?: Array<{ message?: string }>;
  };

  const markdown = result.document?.md_content || '';
  const extractionTimeMs = Date.now() - startTime;

  const metadata: ExtractionMetadata = {
    extraction_time_ms: extractionTimeMs,
    docling_version: 'v1alpha',
  };

  return { markdown, metadata };
};

const UpdateFileExtraction = `
  mutation UpdateFileExtraction(
    $fileId: UUID!
    $extractedText: String!
    $extractedMetadata: JSON!
    $extractionStatus: String!
  ) {
    updateAppFile(
      input: {
        id: $fileId
        appFilePatch: {
          extractedText: $extractedText
          extractedMetadata: $extractedMetadata
          extractionStatus: $extractionStatus
        }
      }
    ) {
      appFile {
        id
        extractionStatus
      }
    }
  }
`;

const updateTestTable = async (
  fileKey: string,
  extractedText: string,
  metadata: ExtractionMetadata,
  status: string
): Promise<void> => {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL ||
      `postgres://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'postgres'}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'constructive'}`
  });
  await client.connect();
  try {
    await client.query(
      `UPDATE public.test_extractions
       SET extracted_text = $1, extracted_metadata = $2, extraction_status = $3
       WHERE file_key = $4`,
      [extractedText, JSON.stringify(metadata), status, fileKey]
    );
  } finally {
    await client.end();
  }
};

const updateDynamicTable = async (
  schema: string,
  table: string,
  fileId: string,
  extractedText: string,
  metadata: ExtractionMetadata,
  status: string
): Promise<void> => {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL ||
      `postgres://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'postgres'}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'constructive'}`
  });
  await client.connect();
  try {
    const query = `
      UPDATE "${schema}"."${table}"
      SET extracted_text = $1,
          extracted_metadata = $2,
          extraction_status = $3
      WHERE id = $4::uuid
    `;
    await client.query(query, [
      extractedText,
      JSON.stringify(metadata),
      status,
      fileId
    ]);
  } finally {
    await client.end();
  }
};

const handler: FunctionHandler<ExtractionPayload> = async (params, ctx) => {
  const { file_id, key, mime_type, bucket_id, table, schema } = params;

  if (!file_id || !key) {
    throw new Error('Missing required payload fields: file_id, key');
  }

  // Determine update mode: dynamic table (when schema/table provided), test table, or GraphQL
  const useDynamicTable = schema && table && process.env.USE_DYNAMIC_TABLE !== 'false';
  const useTestTable = process.env.USE_TEST_TABLE === 'true';

  // S3 bucket name from env (the actual MinIO/S3 bucket, not the database bucket_id)
  const s3BucketName = process.env.S3_BUCKET_NAME || process.env.BUCKET_NAME || 'constructive-uploads';

  ctx.log.info('Starting document extraction', {
    file_id,
    key,
    mime_type,
    bucket_id,
    s3_bucket: s3BucketName
  });

  const s3 = createS3Client();

  try {
    const fileBuffer = await downloadFile(s3, s3BucketName, key);
    ctx.log.info('Downloaded file from S3', {
      file_id,
      size: fileBuffer.length
    });

    const filename = key.split('/').pop() || 'document';
    const { markdown, metadata } = await extractWithDocling(
      fileBuffer,
      filename,
      mime_type
    );

    ctx.log.info('Extraction completed', {
      file_id,
      markdown_length: markdown.length,
      extraction_time_ms: metadata.extraction_time_ms
    });

    if (useDynamicTable && schema && table) {
      await updateDynamicTable(schema, table, file_id, markdown, metadata, 'completed');
      ctx.log.info('Updated dynamic table', { schema, table, file_id });
    } else if (useTestTable) {
      await updateTestTable(key, markdown, metadata, 'completed');
      ctx.log.info('Updated test table', { key });
    } else {
      await ctx.client.request(UpdateFileExtraction, {
        fileId: file_id,
        extractedText: markdown,
        extractedMetadata: metadata,
        extractionStatus: 'completed'
      });
      ctx.log.info('Updated file record via GraphQL', { file_id });
    }

    return { complete: true, extraction_time_ms: metadata.extraction_time_ms };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ctx.log.error('Extraction failed', { file_id, error: errorMessage });

    try {
      const errorMetadata = { error: errorMessage } as ExtractionMetadata;
      if (useDynamicTable && schema && table) {
        await updateDynamicTable(schema, table, file_id, '', errorMetadata, 'failed');
      } else if (useTestTable) {
        await updateTestTable(key, '', errorMetadata, 'failed');
      } else {
        await ctx.client.request(UpdateFileExtraction, {
          fileId: file_id,
          extractedText: '',
          extractedMetadata: errorMetadata,
          extractionStatus: 'failed'
        });
      }
    } catch (updateError) {
      ctx.log.error('Failed to update file status', { file_id, updateError });
    }

    throw error;
  }
};

export default handler;
