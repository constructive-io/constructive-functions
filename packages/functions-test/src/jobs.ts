import type { PgTestClient } from 'pgsql-test/test-client';

export interface JobRow {
  id: number;
  database_id: string | null;
  actor_id: string | null;
  entity_id: string | null;
  organization_id: string | null;
  entity_type: string | null;
  queue_name: string | null;
  task_identifier: string;
  payload: Record<string, unknown>;
  priority: number;
  run_at: Date;
  attempts: number;
  max_attempts: number;
  key: string | null;
  last_error: string | null;
  locked_at: Date | null;
  locked_by: string | null;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AddJobOptions {
  queue_name?: string;
  run_at?: Date;
  max_attempts?: number;
  priority?: number;
}

/**
 * Add a job to the `app_jobs.jobs` queue.
 *
 * Calls `app_jobs.add_job()` — the same function the compute-service uses.
 *
 * @param client - PgTestClient (typically the `pg` superuser client)
 * @param taskIdentifier - Function name to dispatch (e.g., 'send-email')
 * @param payload - JSON payload for the job
 * @param opts - Optional queue_name, run_at, max_attempts, priority, flags
 * @returns The created job row
 */
export async function addJob(
  client: PgTestClient,
  taskIdentifier: string,
  payload: Record<string, unknown> = {},
  opts: AddJobOptions = {}
): Promise<JobRow> {
  const parts: string[] = ['$1::text', '$2::json'];
  const values: unknown[] = [taskIdentifier, JSON.stringify(payload)];
  let idx = 3;

  if (opts.queue_name !== undefined) {
    parts.push(`queue_name := $${idx}`);
    values.push(opts.queue_name);
    idx++;
  }
  if (opts.run_at !== undefined) {
    parts.push(`run_at := $${idx}::timestamptz`);
    values.push(opts.run_at.toISOString());
    idx++;
  }
  if (opts.max_attempts !== undefined) {
    parts.push(`max_attempts := $${idx}`);
    values.push(opts.max_attempts);
    idx++;
  }
  if (opts.priority !== undefined) {
    parts.push(`priority := $${idx}`);
    values.push(opts.priority);
    idx++;
  }

  const result = await client.one<JobRow>(
    `SELECT * FROM app_jobs.add_job(${parts.join(', ')})`,
    values
  );
  return result;
}

/**
 * Get a job by ID from `app_jobs.jobs`.
 */
export async function getJob(
  client: PgTestClient,
  jobId: number
): Promise<JobRow | null> {
  return client.oneOrNone<JobRow>(
    `SELECT * FROM app_jobs.jobs WHERE id = $1`,
    [jobId]
  );
}

/**
 * Wait for a job to reach a terminal state (completed or permanently failed).
 *
 * Polls `app_jobs.jobs` until the job is either:
 * - Deleted (completed jobs are removed from the table)
 * - Has `last_error` set and `attempts >= max_attempts`
 *
 * @param client - PgTestClient
 * @param jobId - Job ID to wait for
 * @param timeoutMs - Maximum time to wait (default: 10000ms)
 * @param pollMs - Polling interval (default: 200ms)
 * @returns 'completed' if the job was deleted, 'failed' if permanently failed, 'timeout' if timed out
 */
export async function waitForJob(
  client: PgTestClient,
  jobId: number,
  timeoutMs: number = 10000,
  pollMs: number = 200
): Promise<'completed' | 'failed' | 'timeout'> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const job = await getJob(client, jobId);

    if (!job) {
      return 'completed';
    }

    if (job.last_error && job.attempts >= job.max_attempts) {
      return 'failed';
    }

    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }

  return 'timeout';
}
