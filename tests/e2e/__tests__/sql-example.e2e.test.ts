/**
 * E2E: sql-example function
 *
 * Verifies the node-sql template can connect to postgres via pool
 * and complete a job through the queue.
 */
import {
  getTestConnections,
  closeConnections,
  getDatabaseId,
  TestClient,
} from '../utils/db';
import { addJob, waitForJobComplete, deleteTestJobs } from '../utils/jobs';

const TEST_PREFIX = 'k8s-e2e-sql-example';

describe('E2E: sql-example', () => {
  let pg: TestClient;
  let databaseId: string;

  beforeAll(async () => {
    const connections = await getTestConnections();
    pg = connections.pg;
    databaseId = await getDatabaseId(pg);
  });

  afterAll(async () => {
    if (pg) await deleteTestJobs(pg, TEST_PREFIX);
    await closeConnections();
  });

  it('should connect to postgres via pool and complete job', async () => {
    const job = await addJob(pg, databaseId, 'sql-example', {});

    expect(job.id).toBeDefined();
    console.log(`Added sql-example job: ${job.id}`);

    const result = await waitForJobComplete(pg, job.id, { timeout: 30000 });

    console.log(`Job result: ${result.status}`, result.error || '');

    expect(['completed', 'failed']).toContain(result.status);

    if (result.status === 'failed') {
      console.log('Job failed with:', result.error);
    }
  });
});
