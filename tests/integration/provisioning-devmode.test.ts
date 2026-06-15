/**
 * Integration tests for provisioning handlers in dev mode (no K8S_API_URL).
 *
 * Verifies that when K8S_API_URL is not set:
 *   1. namespace:sync-secrets returns { skipped: true, reason: 'no-k8s' }
 *   2. function:sync-resources returns { skipped: true, reason: 'no-k8s' }
 *   3. seed.provision() returns empty result without errors
 */

import type { Pool } from 'pg';

// Ensure K8S_API_URL is NOT set for these tests
const origK8sUrl = process.env.K8S_API_URL;
beforeAll(() => { delete process.env.K8S_API_URL; });
afterAll(() => {
  if (origK8sUrl !== undefined) process.env.K8S_API_URL = origK8sUrl;
});

// Mock the ComputeModuleLoader — the moduleNameMapper resolves
// @constructive-io/module-loader to packages/module-loader/src/index
jest.mock('@constructive-io/module-loader', () => ({
  ComputeModuleLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockResolvedValue({
      functionModule: {
        publicSchema: 'constructive_compute_public',
        definitionsTable: 'platform_function_definitions',
      },
    }),
  })),
}));

const mockQuery = jest.fn();
const mockPool = {
  query: mockQuery,
  connect: jest.fn(),
  end: jest.fn(),
  on: jest.fn(),
} as unknown as Pool;

describe('Provisioning handlers — dev mode (no K8S_API_URL)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('namespace:sync-secrets', () => {
    it('skips K8s operations and returns skipped result', async () => {
      const { handleNamespaceSyncSecrets } = require(
        '../../packages/provisioning-handlers/src/handlers/namespace-sync-secrets'
      );

      mockQuery
        // Resolve namespace name from id
        .mockResolvedValueOnce({ rows: [{ name: 'my-app' }] })
        // Read secrets
        .mockResolvedValueOnce({ rows: [{ key: 'API_KEY', decrypted_value: 'secret123' }] });

      const result = await handleNamespaceSyncSecrets(
        { id: 'ns-001' },
        { pool: mockPool, databaseId: 'db-test' }
      );

      expect(result).toEqual({ skipped: true, reason: 'no-k8s' });
    });

    it('throws when neither id nor namespace_name is provided', async () => {
      const { handleNamespaceSyncSecrets } = require(
        '../../packages/provisioning-handlers/src/handlers/namespace-sync-secrets'
      );

      await expect(
        handleNamespaceSyncSecrets({}, { pool: mockPool, databaseId: 'db-test' })
      ).rejects.toThrow('missing "id" or "namespace_name"');
    });
  });

  describe('function:sync-resources', () => {
    it('skips K8s operations for functions with images', async () => {
      const { handleFunctionSyncResources } = require(
        '../../packages/provisioning-handlers/src/handlers/function-sync-resources'
      );

      // Mock: function definition query
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'fn-001',
          name: 'my-func',
          task_identifier: 'my-func',
          service_url: null,
          runtime: 'container',
          image: 'ghcr.io/org/my-func:latest',
          concurrency: 10,
          scale_min: 1,
          scale_max: 5,
          timeout_seconds: 300,
          resources: {},
          namespace_id: null,
        }],
      });

      const result = await handleFunctionSyncResources(
        { id: 'fn-001' },
        { pool: mockPool, databaseId: 'db-test' }
      );

      expect(result).toEqual({ skipped: true, reason: 'no-k8s' });
    });

    it('skips inline runtime functions without hitting K8s', async () => {
      const { handleFunctionSyncResources } = require(
        '../../packages/provisioning-handlers/src/handlers/function-sync-resources'
      );

      // Mock: function definition query
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'fn-002',
          name: 'inline-func',
          task_identifier: 'inline-func',
          service_url: null,
          runtime: 'inline',
          image: null,
          concurrency: 0,
          scale_min: 0,
          scale_max: 0,
          timeout_seconds: 300,
          resources: {},
          namespace_id: null,
        }],
      });

      const result = await handleFunctionSyncResources(
        { id: 'fn-002' },
        { pool: mockPool, databaseId: 'db-test' }
      );

      expect(result).toEqual({ skipped: true, reason: 'inline-runtime' });
    });

    it('throws when function id is missing', async () => {
      const { handleFunctionSyncResources } = require(
        '../../packages/provisioning-handlers/src/handlers/function-sync-resources'
      );

      await expect(
        handleFunctionSyncResources({}, { pool: mockPool, databaseId: 'db-test' })
      ).rejects.toThrow('missing "id"');
    });
  });

  describe('seed.provision()', () => {
    it('returns empty result in dev mode without errors', async () => {
      const { provision } = require(
        '../../packages/provisioning-handlers/src/seed'
      );

      const result = await provision({
        pool: mockPool,
        databaseId: 'db-test',
      });

      expect(result).toEqual({
        namespaces: [],
        secrets: [],
        functions: [],
      });

      // Should not have queried the database at all
      expect(mockQuery).not.toHaveBeenCalled();
    });
  });
});
