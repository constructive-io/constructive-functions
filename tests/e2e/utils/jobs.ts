import { TestClient } from './db';

export interface Job {
  id: string;
  database_id: string;
  queue_name: string | null;
  task_identifier: string;
  payload: Record<string, any>;
  priority: number;
  run_at: Date;
  attempts: number;
  max_attempts: number;
  key: string | null;
  last_error: string | null;
  locked_at: Date | null;
  locked_by: string | null;
}

export async function addJob(
  pg: TestClient,
  databaseId: string,
  taskIdentifier: string,
  payload: Record<string, any>
): Promise<Job> {
  const job = await pg.oneOrNone<Job>(
    `SELECT * FROM app_jobs.add_job($1::uuid, $2::text, $3::json)`,
    [databaseId, taskIdentifier, JSON.stringify(payload)]
  );
  if (!job) {
    throw new Error(`Failed to add job: ${taskIdentifier}`);
  }
  return job;
}

export async function getJobById(pg: TestClient, jobId: string): Promise<Job | null> {
  return pg.oneOrNone<Job>(`SELECT * FROM app_jobs.jobs WHERE id = $1`, [jobId]);
}

export async function getAllJobs(pg: TestClient): Promise<Job[]> {
  return pg.any<Job>(`SELECT * FROM app_jobs.jobs ORDER BY id DESC`);
}

export async function deleteTestJobs(pg: TestClient, prefix: string): Promise<number> {
  const result = await pg.result(
    `DELETE FROM app_jobs.jobs WHERE task_identifier LIKE $1 RETURNING id`,
    [`${prefix}%`]
  );
  return result.rowCount || 0;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for a job to be picked up and completed (deleted) by the job service.
 * Returns 'completed' if the job disappears, 'failed' if it has last_error, 'timeout' otherwise.
 */
export async function waitForJobComplete(
  pg: TestClient,
  jobId: string,
  options: { timeout?: number; pollInterval?: number } = {}
): Promise<{ status: 'completed' | 'failed' | 'timeout'; job?: Job; error?: string }> {
  const { timeout = 30000, pollInterval = 500 } = options;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const job = await getJobById(pg, jobId);

    // Job deleted = completed successfully
    if (!job) {
      return { status: 'completed' };
    }

    // Job has error = failed
    if (job.last_error) {
      return { status: 'failed', job, error: job.last_error };
    }

    await sleep(pollInterval);
  }

  const job = await getJobById(pg, jobId);
  return {
    status: 'timeout',
    job: job || undefined,
    error: `Job did not complete within ${timeout}ms`,
  };
}
