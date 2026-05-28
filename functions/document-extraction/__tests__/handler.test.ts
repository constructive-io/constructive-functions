import { createMockContext } from '../../../tests/helpers/mock-context';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({
      Body: {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from('mock file content');
        }
      }
    })
  })),
  GetObjectCommand: jest.fn()
}));

jest.mock('node-fetch', () =>
  jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      markdown: '# Extracted Document\n\nThis is the extracted content.',
      metadata: { pages: 3, language: 'en' }
    })
  })
);

const loadHandler = () => {
  const mod = require('../handler');
  return mod.default ?? mod;
};

describe('document-extraction handler', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.AWS_ACCESS_KEY_ID = 'test-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
    process.env.S3_ENDPOINT = 'http://localhost:9000';
    process.env.DOCLING_URL = 'http://localhost:5001';
  });

  afterEach(() => {
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.S3_ENDPOINT;
    delete process.env.DOCLING_URL;
    jest.clearAllMocks();
  });

  describe('validation', () => {
    it('throws on missing file_id', async () => {
      const handler = loadHandler();
      await expect(
        handler(
          { key: 'test.pdf', mime_type: 'application/pdf', bucket_id: 'files' },
          createMockContext()
        )
      ).rejects.toThrow('Missing required payload fields');
    });

    it('throws on missing key', async () => {
      const handler = loadHandler();
      await expect(
        handler(
          { file_id: '123', mime_type: 'application/pdf', bucket_id: 'files' },
          createMockContext()
        )
      ).rejects.toThrow('Missing required payload fields');
    });

    it('throws on missing bucket_id', async () => {
      const handler = loadHandler();
      await expect(
        handler(
          { file_id: '123', key: 'test.pdf', mime_type: 'application/pdf' },
          createMockContext()
        )
      ).rejects.toThrow('Missing required payload fields');
    });
  });

  describe('extraction', () => {
    it('returns complete: true on successful extraction', async () => {
      const handler = loadHandler();
      const ctx = createMockContext();

      const result = await handler(
        {
          file_id: '123',
          key: 'documents/test.pdf',
          mime_type: 'application/pdf',
          bucket_id: 'files'
        },
        ctx
      );

      expect(result).toMatchObject({ complete: true });
      expect(result.extraction_time_ms).toBeDefined();
    });

    it('calls GraphQL mutation to update file', async () => {
      const handler = loadHandler();
      const ctx = createMockContext();

      await handler(
        {
          file_id: '123',
          key: 'documents/test.pdf',
          mime_type: 'application/pdf',
          bucket_id: 'files'
        },
        ctx
      );

      expect(ctx.client.request).toHaveBeenCalledWith(
        expect.stringContaining('updateFile'),
        expect.objectContaining({
          fileId: '123',
          extractedText: expect.any(String),
          extractedMetadata: expect.any(Object),
          extractionStatus: 'completed'
        })
      );
    });
  });

  describe('error handling', () => {
    it('updates file status to failed on extraction error', async () => {
      const fetch = require('node-fetch');
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      });

      const handler = loadHandler();
      const ctx = createMockContext();

      await expect(
        handler(
          {
            file_id: '123',
            key: 'documents/test.pdf',
            mime_type: 'application/pdf',
            bucket_id: 'files'
          },
          ctx
        )
      ).rejects.toThrow('Docling extraction failed');

      expect(ctx.client.request).toHaveBeenCalledWith(
        expect.stringContaining('updateFile'),
        expect.objectContaining({
          fileId: '123',
          extractionStatus: 'failed'
        })
      );
    });
  });
});
