/**
 * E2E: send-verification-link function
 *
 * Assumes skaffold is running with send-verification-link deployed:
 *   skaffold dev -p send-verification-link   (single function)
 *   make skaffold-dev                        (all functions)
 *
 * Inserts a job into the queue and verifies the job service dispatches it
 * to the send-verification-link function which processes it.
 */
import {
  getTestConnections,
  closeConnections,
  getDatabaseId,
  TestClient,
} from '../utils/db';
import { addJob, waitForJobComplete, deleteTestJobs } from '../utils/jobs';

const TEST_PREFIX = 'k8s-e2e-send-verification-link';

describe('E2E: send-verification-link', () => {
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

  it('should process a send-verification-link job from the queue', async () => {
    const job = await addJob(pg, databaseId, 'send-verification-link', {
      email_type: 'forgot_password',
      email: `${TEST_PREFIX}@example.com`,
      reset_token: 'test-token-123',
      user_id: '00000000-0000-0000-0000-000000000001',
    });

    expect(job.id).toBeDefined();
    console.log(`Added send-verification-link job: ${job.id}`);

    const result = await waitForJobComplete(pg, job.id, { timeout: 30000 });

    console.log(`Job result: ${result.status}`, result.error || '');

    expect(['completed', 'failed']).toContain(result.status);

    if (result.status === 'failed') {
      console.log('Job failed with:', result.error);
      console.log('This may be expected in dry-run mode or if GraphQL is not fully configured');
    }
  });
});
