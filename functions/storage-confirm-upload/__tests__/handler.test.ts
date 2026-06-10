import { createMockContext } from '../../../tests/helpers/mock-context';

const mockSend = jest.fn();
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockSend
  })),
  HeadObjectCommand: jest.fn().mockImplementation((params) => params)
}));

const mockPgQuery = jest.fn();
const mockPgConnect = jest.fn();
const mockPgEnd = jest.fn();
jest.mock('pg', () => ({
  Client: jest.fn().mockImplementation(() => ({
    connect: mockPgConnect,
    query: mockPgQuery,
    end: mockPgEnd
  }))
}));

const loadHandler = () => {
  const mod = require('../handler');
  return mod.default ?? mod;
};

describe('storage-confirm-upload handler', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.S3_ENDPOINT = 'http://localhost:9000';
    process.env.AWS_ACCESS_KEY_ID = 'minioadmin';
    process.env.AWS_SECRET_ACCESS_KEY = 'minioadmin';
    process.env.AWS_REGION = 'us-east-1';
  });

  afterEach(() => {
    delete process.env.S3_ENDPOINT;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_REGION;
  });

  describe('validation', () => {
    it('throws on missing file_id', async () => {
      const handler = loadHandler();
      await expect(
        handler(
          { key: 'test.txt', bucket_id: 'bucket-123' },
          createMockContext()
        )
      ).rejects.toThrow('Missing required fields');
    });

    it('throws on missing key', async () => {
      const handler = loadHandler();
      await expect(
        handler(
          { file_id: '123', bucket_id: 'bucket-123' },
          createMockContext()
        )
      ).rejects.toThrow('Missing required fields');
    });

    it('throws on missing bucket_id', async () => {
      const handler = loadHandler();
      await expect(
        handler(
          { file_id: '123', key: 'test.txt' },
          createMockContext()
        )
      ).rejects.toThrow('Missing required fields');
    });
  });

  describe('S3 file check', () => {
    it('throws when file not found in S3', async () => {
      const handler = loadHandler();
      const notFoundError = new Error('Not Found');
      (notFoundError as any).name = 'NotFound';
      mockSend.mockRejectedValueOnce(notFoundError);

      await expect(
        handler(
          { file_id: '123', key: 'test.txt', bucket_id: 'bucket-123' },
          createMockContext()
        )
      ).rejects.toThrow('File not found in S3');
    });

    it('rethrows unexpected S3 errors', async () => {
      const handler = loadHandler();
      mockSend.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        handler(
          { file_id: '123', key: 'test.txt', bucket_id: 'bucket-123' },
          createMockContext()
        )
      ).rejects.toThrow('Network error');
    });
  });

  describe('confirm upload', () => {
    it('calls confirm function when file exists in S3', async () => {
      const handler = loadHandler();
      mockSend.mockResolvedValueOnce({}); // HeadObject success
      mockPgQuery.mockResolvedValueOnce({ rows: [] }); // confirm_uploaded call

      const result = await handler(
        {
          file_id: '123',
          key: 'test.txt',
          bucket_id: 'bucket-123',
          schema: 'test-db-app-public',
          table: 'app_files'
        },
        createMockContext()
      );

      expect(result.success).toBe(true);
      expect(result.file_id).toBe('123');
      expect(mockPgQuery).toHaveBeenCalled();
    });

    it('uses default schema and table when not provided', async () => {
      const handler = loadHandler();
      mockSend.mockResolvedValueOnce({}); // HeadObject success
      mockPgQuery.mockResolvedValueOnce({ rows: [] }); // confirm_uploaded call

      const result = await handler(
        {
          file_id: '123',
          key: 'test.txt',
          bucket_id: 'bucket-123'
        },
        createMockContext()
      );

      expect(result.success).toBe(true);
      // Should use default storage_public and app_files
      expect(mockPgQuery).toHaveBeenCalledWith(
        expect.stringContaining('app_files_confirm_uploaded'),
        ['123']
      );
    });
  });

  describe('bucket name resolution', () => {
    it('resolves bucket name from database when schema and databaseId provided', async () => {
      const handler = loadHandler();
      // First query: resolve bucket name
      mockPgQuery.mockResolvedValueOnce({ rows: [{ type: 'public' }] });
      // HeadObject success
      mockSend.mockResolvedValueOnce({});
      // Second query: confirm_uploaded call
      mockPgQuery.mockResolvedValueOnce({ rows: [] });

      const context = createMockContext();
      context.job.databaseId = 'db-123';

      const result = await handler(
        {
          file_id: '123',
          key: 'test.txt',
          bucket_id: 'bucket-123',
          schema: 'test-db-app-public'
        },
        context
      );

      expect(result.success).toBe(true);
      expect(result.bucket).toBe('test-bucket-public-db-123');
    });

    it('falls back to bucket_id when resolution fails', async () => {
      const handler = loadHandler();
      // First query fails
      mockPgQuery.mockRejectedValueOnce(new Error('DB error'));
      // HeadObject success
      mockSend.mockResolvedValueOnce({});
      // Second query: confirm_uploaded call
      mockPgQuery.mockResolvedValueOnce({ rows: [] });

      const context = createMockContext();
      context.job.databaseId = 'db-123';

      const result = await handler(
        {
          file_id: '123',
          key: 'test.txt',
          bucket_id: 'bucket-123',
          schema: 'test-db-app-public'
        },
        context
      );

      expect(result.success).toBe(true);
      expect(result.bucket).toBe('bucket-123');
    });
  });
});
