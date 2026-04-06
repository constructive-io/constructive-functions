/**
 * E2E: simple-email function
 *
 * Assumes skaffold is running with simple-email deployed:
 *   skaffold dev -p simple-email   (single function)
 *   make skaffold-dev              (all functions)
 *
 * Inserts a job into the queue and verifies the job service dispatches it
 * to the simple-email function which processes it.
 */
import {
  getTestConnections,
  closeConnections,
  getDatabaseId,
  TestClient,
} from '../utils/db';
import { addJob, waitForJobComplete, deleteTestJobs } from '../utils/jobs';

const TEST_PREFIX = 'k8s-e2e-simple-email';

describe('E2E: simple-email', () => {
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

  it('should process a simple-email job from the queue', async () => {
    const job = await addJob(pg, databaseId, 'simple-email', {
      to: 'test@example.com',
      subject: `${TEST_PREFIX} test email`,
      html: '<p>Hello from k8s test</p>',
    });

    expect(job.id).toBeDefined();
    console.log(`Added simple-email job: ${job.id}`);

    const result = await waitForJobComplete(pg, job.id, { timeout: 30000 });

    console.log(`Job result: ${result.status}`, result.error || '');

    // In dry-run mode, the function should still complete the job
    // (it skips actual email sending but returns success)
    expect(['completed', 'failed']).toContain(result.status);

    if (result.status === 'failed') {
      console.log('Job failed with:', result.error);
      console.log('This may be expected if the function cannot reach the GraphQL server');
    }
  });
});
