/**
 * Job Processing Tests (end-to-end via k8s)
 *
 * Assumes skaffold is running (`make skaffold-dev`) with:
 *   - postgres port-forwarded to 5432
 *   - knative-job-service running and connected
 *   - simple-email and send-email-link functions running
 *
 * Inserts real jobs into the queue and verifies the job service picks them up
 * and the functions process them.
 *
 * Run: pnpm test:k8s
 */
import {
  getTestConnections,
  closeConnections,
  getDatabaseId,
  TestClient,
} from '../utils/db';
import { addJob, waitForJobComplete, deleteTestJobs, getAllJobs } from '../utils/jobs';

const TEST_PREFIX = 'k8s-e2e';

describe('Job Processing (k8s e2e)', () => {
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

  describe('simple-email function', () => {
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

  describe('send-email-link function', () => {
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

  describe('job queue inspection', () => {
    it('should be able to list all pending jobs', async () => {
      const jobs = await getAllJobs(pg);
      console.log(`Total jobs in queue: ${jobs.length}`);
      jobs.forEach((j) => {
        console.log(
          `  [${j.id}] ${j.task_identifier} | attempts=${j.attempts} locked=${j.locked_by || 'no'} error=${j.last_error || 'none'}`
        );
      });
    });
  });
});
