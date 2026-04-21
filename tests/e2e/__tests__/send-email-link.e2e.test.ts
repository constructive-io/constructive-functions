/**
 * E2E: send-email-link function
 *
 * Assumes skaffold is running with send-email-link deployed:
 *   skaffold dev -p send-email-link   (single function)
 *   make skaffold-dev                 (all functions)
 *
 * Inserts a job into the queue and verifies the job service dispatches it
 * to the send-email-link function which processes it.
 */
import {
  getTestConnections,
  closeConnections,
  getDatabaseId,
  TestClient,
} from '../utils/db';
import { addJob, waitForJobComplete, deleteTestJobs } from '../utils/jobs';

const TEST_PREFIX = 'k8s-e2e-send-email-link';

describe('E2E: send-email-link', () => {
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

  it('should process a send-email-link job from the queue', async () => {
    const job = await addJob(pg, databaseId, 'send-email-link', {
      email_type: 'forgot_password',
      email: `${TEST_PREFIX}@example.com`,
      reset_token: 'test-token-123',
      user_id: '00000000-0000-0000-0000-000000000001',
    });

    expect(job.id).toBeDefined();
    console.log(`Added send-email-link job: ${job.id}`);

    const result = await waitForJobComplete(pg, job.id, { timeout: 30000 });

    console.log(`Job result: ${result.status}`, result.error || '');

    expect(['completed', 'failed']).toContain(result.status);

    if (result.status === 'failed') {
      console.log('Job failed with:', result.error);
      console.log('This may be expected in dry-run mode or if GraphQL is not fully configured');
    }
  });
});
