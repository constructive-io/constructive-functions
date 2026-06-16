import { createMockContext } from '../../../tests/helpers/mock-context';

const mockSend = jest.fn();
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockSend
  })),
  HeadObjectCommand: jest.fn().mockImplementation((params) => params)
}));

const mockStorageModuleRow = {
  id: 'sm-123',
  buckets_schema: 'test-db-storage-public',
  buckets_table: 'app_buckets',
  files_schema: 'test-db-storage-public',
  files_table: 'app_files',
  endpoint: null,
  provider: 'minio',
};

const createMockPool = () => {
  const mockQuery = jest.fn();
  const mockRelease = jest.fn();
  const mockClient = {
    query: mockQuery,
    release: mockRelease
  };
  const pool = {
    connect: jest.fn().mockResolvedValue(mockClient),
    query: mockQuery,
    _mockClient: mockClient,
    _mockQuery: mockQuery
  };
  return pool;
};

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
      const pool = createMockPool();
      await expect(
        handler(
          { key: 'test.txt', bucket_id: 'bucket-123' },
          createMockContext({ pool, databaseId: 'db-123' })
        )
      ).rejects.toThrow('Missing required fields');
    });

    it('throws on missing key', async () => {
      const handler = loadHandler();
      const pool = createMockPool();
      await expect(
        handler(
          { file_id: '123', bucket_id: 'bucket-123' },
          createMockContext({ pool, databaseId: 'db-123' })
        )
      ).rejects.toThrow('Missing required fields');
    });

    it('throws on missing bucket_id', async () => {
      const handler = loadHandler();
      const pool = createMockPool();
      await expect(
        handler(
          { file_id: '123', key: 'test.txt' },
          createMockContext({ pool, databaseId: 'db-123' })
        )
      ).rejects.toThrow('Missing required fields');
    });

    it('throws on missing databaseId', async () => {
      const handler = loadHandler();
      const pool = createMockPool();
      await expect(
        handler(
          { file_id: '123', key: 'test.txt', bucket_id: 'bucket-123' },
          createMockContext({ pool, databaseId: undefined })
        )
      ).rejects.toThrow('Missing databaseId');
    });
  });

  describe('storage module lookup', () => {
    it('throws when storage module not found', async () => {
      const handler = loadHandler();
      const pool = createMockPool();
      pool._mockQuery.mockResolvedValueOnce({ rows: [] }); // No storage module

      await expect(
        handler(
          { file_id: '123', key: 'test.txt', bucket_id: 'bucket-123' },
          createMockContext({ pool, databaseId: 'db-123' })
        )
      ).rejects.toThrow('STORAGE_MODULE_NOT_FOUND');
    });
  });

  describe('S3 file check', () => {
    it('throws when file not found in S3', async () => {
      const handler = loadHandler();
      const pool = createMockPool();
      // Storage module query
      pool._mockQuery.mockResolvedValueOnce({ rows: [mockStorageModuleRow] });
      // Bucket type query
      pool._mockQuery.mockResolvedValueOnce({ rows: [{ type: 'public' }] });
      // S3 HeadObject fails
      const notFoundError = new Error('Not Found');
      (notFoundError as any).name = 'NotFound';
      mockSend.mockRejectedValueOnce(notFoundError);

      await expect(
        handler(
          { file_id: '123', key: 'test.txt', bucket_id: 'bucket-123' },
          createMockContext({ pool, databaseId: 'db-123' })
        )
      ).rejects.toThrow('File not found in S3');
    });

    it('rethrows unexpected S3 errors', async () => {
      const handler = loadHandler();
      const pool = createMockPool();
      pool._mockQuery.mockResolvedValueOnce({ rows: [mockStorageModuleRow] });
      pool._mockQuery.mockResolvedValueOnce({ rows: [{ type: 'public' }] });
      mockSend.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        handler(
          { file_id: '123', key: 'test.txt', bucket_id: 'bucket-123' },
          createMockContext({ pool, databaseId: 'db-123' })
        )
      ).rejects.toThrow('Network error');
    });
  });

  describe('confirm upload', () => {
    it('calls confirm function when file exists in S3', async () => {
      const handler = loadHandler();
      const pool = createMockPool();
      // Storage module query
      pool._mockQuery.mockResolvedValueOnce({ rows: [mockStorageModuleRow] });
      // Bucket type query
      pool._mockQuery.mockResolvedValueOnce({ rows: [{ type: 'public' }] });
      // S3 HeadObject success
      mockSend.mockResolvedValueOnce({});
      // Confirm uploaded call
      pool._mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await handler(
        { file_id: '123', key: 'test.txt', bucket_id: 'bucket-123' },
        createMockContext({ pool, databaseId: 'db-123' })
      );

      expect(result.success).toBe(true);
      expect(result.file_id).toBe('123');
      // Verify confirm function was called with correct schema
      expect(pool._mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('test-db-storage-private'),
        ['123']
      );
      expect(pool._mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('app_files_confirm_uploaded'),
        ['123']
      );
    });

    it('uses schema names from storage_module metadata', async () => {
      const handler = loadHandler();
      const pool = createMockPool();
      const customRow = {
        ...mockStorageModuleRow,
        buckets_schema: 'custom-db-storage-public',
        files_schema: 'custom-db-storage-public',
        files_table: 'custom_files',
      };
      pool._mockQuery.mockResolvedValueOnce({ rows: [customRow] });
      pool._mockQuery.mockResolvedValueOnce({ rows: [{ type: 'private' }] });
      mockSend.mockResolvedValueOnce({});
      pool._mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await handler(
        { file_id: '456', key: 'doc.pdf', bucket_id: 'bucket-456' },
        createMockContext({ pool, databaseId: 'custom-db' })
      );

      expect(result.success).toBe(true);
      // Verify it used the custom schema/table from storage_module
      expect(pool._mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('custom-db-storage-private'),
        ['456']
      );
      expect(pool._mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('custom_files_confirm_uploaded'),
        ['456']
      );
    });
  });

  describe('bucket name resolution', () => {
    it('resolves bucket name from database using storage_module schema', async () => {
      const handler = loadHandler();
      const pool = createMockPool();
      pool._mockQuery.mockResolvedValueOnce({ rows: [mockStorageModuleRow] });
      pool._mockQuery.mockResolvedValueOnce({ rows: [{ type: 'public' }] });
      mockSend.mockResolvedValueOnce({});
      pool._mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await handler(
        { file_id: '123', key: 'test.txt', bucket_id: 'bucket-123' },
        createMockContext({ pool, databaseId: 'db-123' })
      );

      expect(result.success).toBe(true);
      expect(result.bucket).toBe('test-bucket-public-db-123');
      // Verify bucket query used correct schema from storage_module
      expect(pool._mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('test-db-storage-public'),
        ['bucket-123']
      );
    });

    it('falls back to bucket_id when resolution fails', async () => {
      const handler = loadHandler();
      const pool = createMockPool();
      pool._mockQuery.mockResolvedValueOnce({ rows: [mockStorageModuleRow] });
      pool._mockQuery.mockRejectedValueOnce(new Error('DB error'));
      mockSend.mockResolvedValueOnce({});
      pool._mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await handler(
        { file_id: '123', key: 'test.txt', bucket_id: 'bucket-123' },
        createMockContext({ pool, databaseId: 'db-123' })
      );

      expect(result.success).toBe(true);
      expect(result.bucket).toBe('bucket-123');
    });
  });
});
