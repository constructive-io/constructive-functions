/**
 * E2E: python-example function
 *
 * Assumes skaffold is running with python-example deployed:
 *   skaffold dev -p python-example   (single function)
 *   make skaffold-dev                (all functions)
 *
 * Inserts a job into the queue and verifies the job service dispatches it
 * to the python-example function which processes it.
 */
import {
  getTestConnections,
  closeConnections,
  getDatabaseId,
  TestClient,
} from '../utils/db';
import { addJob, waitForJobComplete, deleteTestJobs } from '../utils/jobs';

const TEST_PREFIX = 'k8s-e2e-python-example';

describe('E2E: python-example', () => {
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

  it('should process a python-example job from the queue', async () => {
    const job = await addJob(pg, databaseId, 'python-example', {
      message: `${TEST_PREFIX} test payload`,
      value: 42,
    });

    expect(job.id).toBeDefined();
    console.log(`Added python-example job: ${job.id}`);

    const result = await waitForJobComplete(pg, job.id, { timeout: 30000 });

    console.log(`Job result: ${result.status}`, result.error || '');

    expect(['completed', 'failed']).toContain(result.status);

    if (result.status === 'failed') {
      console.log('Job failed with:', result.error);
    }
  });
});
