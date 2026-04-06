/**
 * SQL Job Queue Tests
 *
 * Assumes skaffold is running (`make skaffold-dev`) with port-forward to postgres on 5432.
 * Tests the job queue SQL layer: adding jobs, querying, schema verification.
 *
 * Run: pnpm test:k8s
 */
import {
  getTestConnections,
  closeConnections,
  getDatabaseId,
  verifyJobsSchema,
  TestClient,
} from '../utils/db';
import { addJob, getJobById, getAllJobs, deleteTestJobs } from '../utils/jobs';

const TEST_PREFIX = 'k8s-test';

describe('SQL: Job Queue (k8s)', () => {
  let pg: TestClient;
  let databaseId: string;

  beforeAll(async () => {
    const connections = await getTestConnections();
    pg = connections.pg;

    const schema = await verifyJobsSchema(pg);
    if (!schema.schemaExists) {
      throw new Error(
        'app_jobs schema not found. Is the db-setup job complete? Check: kubectl get pods -n constructive-functions'
      );
    }

    databaseId = await getDatabaseId(pg);
  });

  afterAll(async () => {
    if (pg) await deleteTestJobs(pg, TEST_PREFIX);
    await closeConnections();
  });

  describe('schema verification', () => {
    it('should have app_jobs schema with all required functions', async () => {
      const schema = await verifyJobsSchema(pg);

      expect(schema.schemaExists).toBe(true);
      expect(schema.addJobExists).toBe(true);
      expect(schema.getJobExists).toBe(true);
      expect(schema.completeJobExists).toBe(true);
      expect(schema.failJobExists).toBe(true);
    });
  });

  describe('add_job', () => {
    it('should add a job to the queue', async () => {
      const job = await addJob(pg, databaseId, `${TEST_PREFIX}-basic`, {
        message: 'hello from test',
      });

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.task_identifier).toBe(`${TEST_PREFIX}-basic`);
      expect(job.payload).toEqual({ message: 'hello from test' });
      expect(job.attempts).toBe(0);
      expect(job.locked_by).toBeNull();
    });

    it('should retrieve added job by ID', async () => {
      const created = await addJob(pg, databaseId, `${TEST_PREFIX}-retrieve`, {
        key: 'value',
      });

      const retrieved = await getJobById(pg, created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(created.id);
      expect(retrieved!.payload).toEqual({ key: 'value' });
    });
  });
});
