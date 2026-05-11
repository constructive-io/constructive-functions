/**
 * Job Queue Inspection (end-to-end via k8s)
 *
 * Shared utility test for inspecting queue state. Individual function e2e tests
 * are in per-function files: send-email.e2e.test.ts, send-verification-link.e2e.test.ts
 */
import {
  getTestConnections,
  closeConnections,
  TestClient,
} from '../utils/db';
import { getAllJobs } from '../utils/jobs';

describe('Job Queue Inspection (k8s e2e)', () => {
  let pg: TestClient;

  beforeAll(async () => {
    const connections = await getTestConnections();
    pg = connections.pg;
  });

  afterAll(async () => {
    await closeConnections();
  });

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
