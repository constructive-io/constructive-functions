import { createMockContext } from '../../../tests/helpers/mock-context';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn()
  })),
  GetObjectCommand: jest.fn()
}));

jest.mock('graphile-llm', () => ({
  buildEmbedderFromEnv: jest.fn()
}));

const createMockS3Response = (content: string) => ({
  Body: {
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(content);
    }
  }
});

const loadHandler = () => {
  const mod = require('../handler');
  return mod.default ?? mod;
};

describe('process-file-embedding handler', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.BUCKET_PROVIDER = 'minio';
    process.env.AWS_REGION = 'us-east-1';
    process.env.S3_ENDPOINT = 'http://localhost:9000';
    process.env.AWS_ACCESS_KEY = 'minioadmin';
    process.env.AWS_SECRET_KEY = 'minioadmin';
  });

  afterEach(() => {
    delete process.env.BUCKET_PROVIDER;
    delete process.env.AWS_REGION;
    delete process.env.S3_ENDPOINT;
    delete process.env.AWS_ACCESS_KEY;
    delete process.env.AWS_SECRET_KEY;
    delete process.env.PROCESS_FILE_EMBEDDING_DRY_RUN;
  });

  describe('validation', () => {
    it('throws on missing file_id', async () => {
      const handler = loadHandler();
      await expect(
        handler(
          { key: 'test.txt', mime_type: 'text/plain', bucket_id: 'bucket' },
          createMockContext()
        )
      ).rejects.toThrow('Missing required fields');
    });

    it('throws on missing key', async () => {
      const handler = loadHandler();
      await expect(
        handler(
          { file_id: '123', mime_type: 'text/plain', bucket_id: 'bucket' },
          createMockContext()
        )
      ).rejects.toThrow('Missing required fields');
    });

    it('throws on missing bucket_id', async () => {
      const handler = loadHandler();
      await expect(
        handler(
          { file_id: '123', key: 'test.txt', mime_type: 'text/plain' },
          createMockContext()
        )
      ).rejects.toThrow('Missing required fields');
    });
  });

  describe('extraction mode delegation', () => {
    it('delegates to extraction pipeline when extraction config present', async () => {
      const handler = loadHandler();

      const result = await handler(
        {
          file_id: '123',
          key: 'document.pdf',
          mime_type: 'application/pdf',
          bucket_id: 'bucket',
          extraction: {
            task_identifier: 'extract:process_document_extraction'
          }
        },
        createMockContext({ env: { PROCESS_FILE_EMBEDDING_DRY_RUN: 'true' } })
      );

      expect(result).toEqual({
        complete: true,
        dryRun: true,
        delegated: true,
        task_identifier: 'extract:process_document_extraction'
      });
    });

    it('uses default extraction task_identifier when not specified', async () => {
      const handler = loadHandler();

      const result = await handler(
        {
          file_id: '123',
          key: 'document.pdf',
          mime_type: 'application/pdf',
          bucket_id: 'bucket',
          extraction: {}
        },
        createMockContext({ env: { PROCESS_FILE_EMBEDDING_DRY_RUN: 'true' } })
      );

      expect(result.task_identifier).toBe('extract:process_document_extraction');
    });
  });

  describe('direct mode embedding', () => {
    beforeEach(() => {
      const { S3Client } = require('@aws-sdk/client-s3');
      S3Client.mockImplementation(() => ({
        send: jest.fn().mockResolvedValue(createMockS3Response('Hello world'))
      }));

      const { buildEmbedderFromEnv } = require('graphile-llm');
      buildEmbedderFromEnv.mockReturnValue(
        jest.fn().mockResolvedValue({
          embedding: [0.1, 0.2, 0.3],
          promptTokens: 2
        })
      );
    });

    it('processes text file and updates embedding', async () => {
      const handler = loadHandler();
      const mockContext = createMockContext();

      const result = await handler(
        {
          file_id: '123',
          key: 'test.txt',
          mime_type: 'text/plain',
          bucket_id: 'bucket'
        },
        mockContext
      );

      expect(result).toEqual({ complete: true, dimensions: 3 });
      expect(mockContext.client.request).toHaveBeenCalled();
    });

    it('skips database update in dry-run mode', async () => {
      const handler = loadHandler();
      const mockContext = createMockContext({
        env: { PROCESS_FILE_EMBEDDING_DRY_RUN: 'true' }
      });

      const result = await handler(
        {
          file_id: '123',
          key: 'test.txt',
          mime_type: 'text/plain',
          bucket_id: 'bucket'
        },
        mockContext
      );

      expect(result).toEqual({ complete: true, dryRun: true, dimensions: 3 });
      expect(mockContext.client.request).not.toHaveBeenCalled();
    });

    it('throws when embedder not configured', async () => {
      const { buildEmbedderFromEnv } = require('graphile-llm');
      buildEmbedderFromEnv.mockReturnValue(null);

      const handler = loadHandler();

      await expect(
        handler(
          {
            file_id: '123',
            key: 'test.txt',
            mime_type: 'text/plain',
            bucket_id: 'bucket'
          },
          createMockContext()
        )
      ).rejects.toThrow('No embedder configured');
    });

    it('throws for unsupported mime types in direct mode', async () => {
      const handler = loadHandler();

      await expect(
        handler(
          {
            file_id: '123',
            key: 'image.png',
            mime_type: 'image/png',
            bucket_id: 'bucket'
          },
          createMockContext()
        )
      ).rejects.toThrow('Direct embedding for image/png not yet supported');
    });

    it('throws when file content is empty', async () => {
      const { S3Client } = require('@aws-sdk/client-s3');
      S3Client.mockImplementation(() => ({
        send: jest.fn().mockResolvedValue(createMockS3Response('   '))
      }));

      const handler = loadHandler();

      await expect(
        handler(
          {
            file_id: '123',
            key: 'empty.txt',
            mime_type: 'text/plain',
            bucket_id: 'bucket'
          },
          createMockContext()
        )
      ).rejects.toThrow('File content is empty');
    });
  });

  describe('mime type detection', () => {
    beforeEach(() => {
      const { S3Client } = require('@aws-sdk/client-s3');
      S3Client.mockImplementation(() => ({
        send: jest.fn().mockResolvedValue(createMockS3Response('{"key":"value"}'))
      }));

      const { buildEmbedderFromEnv } = require('graphile-llm');
      buildEmbedderFromEnv.mockReturnValue(
        jest.fn().mockResolvedValue({ embedding: [0.1], promptTokens: 1 })
      );
    });

    it('accepts application/json as text', async () => {
      const handler = loadHandler();
      const result = await handler(
        {
          file_id: '123',
          key: 'data.json',
          mime_type: 'application/json',
          bucket_id: 'bucket'
        },
        createMockContext()
      );
      expect(result.complete).toBe(true);
    });

    it('accepts application/xml as text', async () => {
      const handler = loadHandler();
      const result = await handler(
        {
          file_id: '123',
          key: 'data.xml',
          mime_type: 'application/xml',
          bucket_id: 'bucket'
        },
        createMockContext()
      );
      expect(result.complete).toBe(true);
    });

    it('accepts application/javascript as text', async () => {
      const handler = loadHandler();
      const result = await handler(
        {
          file_id: '123',
          key: 'script.js',
          mime_type: 'application/javascript',
          bucket_id: 'bucket'
        },
        createMockContext()
      );
      expect(result.complete).toBe(true);
    });
  });
});
