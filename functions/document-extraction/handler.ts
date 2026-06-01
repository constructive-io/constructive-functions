import type { FunctionHandler } from '@constructive-io/fn-runtime';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { Readable } from 'stream';
import { TypedDocumentString } from '@constructive-io/graphql-query';
import { singularize, toCamelCase, toPascalCase } from 'inflekt';
import { GraphQLClient } from 'graphql-request';

type ExtractionPayload = {
  // Standard JobTrigger fields
  id: string;
  table?: string;
  schema?: string;
  // Document fields (from payload_fields)
  file_key: string;
  mime_type: string;
  bucket_id: string;
  // Legacy aliases (for backward compatibility)
  file_id?: string;
  key?: string;
};

type ExtractionMetadata = {
  pages?: number;
  language?: string;
  title?: string;
  tables?: number;
  images?: number;
  extraction_time_ms?: number;
  docling_version?: string;
  error?: string;
};

type UpdateResult = {
  [key: string]: {
    [key: string]: { id: string } | null;
  } | null;
};

type UpdateVariables = {
  input: {
    id: string;
    [patchField: string]: unknown;
  };
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

const UpdateFileExtraction = new TypedDocumentString<
  { updateAppFile: { appFile: { id: string; extractionStatus: string } | null } | null },
  { fileId: string; extractedText: string; extractedMetadata: unknown; extractionStatus: string }
>(`
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
`);

const buildDynamicUpdateMutation = (tableName: string): TypedDocumentString<UpdateResult, UpdateVariables> => {
  const singularCamel = toCamelCase(singularize(tableName));
  const singularPascal = toPascalCase(singularize(tableName));

  const query = `
    mutation UpdateDynamicTable($input: Update${singularPascal}Input!) {
      update${singularPascal}(input: $input) {
        ${singularCamel} {
          id
        }
      }
    }
  `;

  return new TypedDocumentString<UpdateResult, UpdateVariables>(query);
};

const updateDynamicTable = async (
  client: GraphQLClient,
  schema: string,
  databaseId: string,
  table: string,
  fileId: string,
  extractedText: string,
  metadata: ExtractionMetadata
): Promise<void> => {
  const singularCamel = toCamelCase(singularize(table));
  const patchFieldName = `${singularCamel}Patch`;
  const mutation = buildDynamicUpdateMutation(table);

  await client.request(mutation.toString(), {
    input: {
      id: fileId,
      [patchFieldName]: {
        extractedText,
        extractedMetadata: metadata,
      },
    },
  }, {
    'X-Database-Id': databaseId,
    'X-Schemata': schema,
  });
};

type DatabaseQueryResult = {
  databases: {
    nodes: Array<{ id: string }>;
  };
};

type DatabaseQueryVariables = {
  name: string;
};

const GetDatabaseByNameQuery = new TypedDocumentString<DatabaseQueryResult, DatabaseQueryVariables>(`
  query GetDatabaseByName($name: String!) {
    databases(condition: { name: $name }, first: 1) {
      nodes {
        id
      }
    }
  }
`);

const extractDatabaseIdFromSchema = async (
  metaClient: { request: <T, V>(doc: TypedDocumentString<T, V>, vars: V) => Promise<T> },
  schema: string
): Promise<string | null> => {
  const match = schema.match(/^([^-]+-[^-]+)-[0-9a-f]+-/);
  if (!match) return null;

  const dbName = match[1].replace(/-/g, '_');
  try {
    const result = await metaClient.request(GetDatabaseByNameQuery, { name: dbName });
    return result.databases.nodes[0]?.id ?? null;
  } catch {
    return null;
  }
};

const resolveS3BucketName = async (
  metaClient: { request: <T, V>(doc: TypedDocumentString<T, V>, vars: V) => Promise<T> },
  schema: string | undefined,
  fallbackDatabaseId: string | undefined,
  bucketKey: string = 'files'
): Promise<string> => {
  const prefix = process.env.S3_BUCKET_NAME || process.env.BUCKET_NAME || 'cnc';

  let databaseId = fallbackDatabaseId;

  if (!databaseId && schema) {
    databaseId = await extractDatabaseIdFromSchema(metaClient, schema) ?? undefined;
  }

  if (databaseId) {
    return `${prefix}-${bucketKey}-${databaseId}`;
  }

  if (process.env.DEFAULT_S3_BUCKET) {
    return process.env.DEFAULT_S3_BUCKET;
  }

  return `${prefix}-uploads`;
};

const handler: FunctionHandler<ExtractionPayload> = async (params, ctx) => {
  const file_id = params.id || params.file_id;
  const key = params.file_key || params.key;
  const { mime_type, bucket_id, table, schema } = params;

  if (!file_id || !key) {
    throw new Error('Missing required payload fields: id/file_id, file_key/key');
  }

  const useDynamicTable = schema && table && process.env.USE_DYNAMIC_TABLE !== 'false';

  const s3BucketName = await resolveS3BucketName(ctx.meta, schema, ctx.job.databaseId);

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

    if (useDynamicTable && schema && table && ctx.job.databaseId) {
      await updateDynamicTable(ctx.client as GraphQLClient, schema, ctx.job.databaseId, table, file_id, markdown, metadata);
      ctx.log.info('Updated dynamic table via GraphQL', { schema, table, file_id });
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
      const errorMetadata: ExtractionMetadata = { error: errorMessage };
      if (useDynamicTable && schema && table && ctx.job.databaseId) {
        await updateDynamicTable(ctx.client as GraphQLClient, schema, ctx.job.databaseId, table, file_id, '', errorMetadata);
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
