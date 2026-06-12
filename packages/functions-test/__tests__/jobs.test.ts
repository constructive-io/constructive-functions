/**
 * Tests for job queue helpers.
 *
 * Requires PostgreSQL running locally with pgpm roles bootstrapped.
 * Needs constructive-infra module deployed (provides app_jobs schema).
 */

import { getConnections, addJob, getJob } from '../src';
import type { FunctionsTestResult } from '../src';

jest.setTimeout(120_000);

describe('job helpers', () => {
  let result: FunctionsTestResult;

  beforeAll(async () => {
    result = await getConnections({ modules: 'all' });
  });

  afterAll(async () => {
    if (result?.teardown) {
      await result.teardown();
    }
  });

  beforeEach(async () => {
    await result.pg.beforeEach();
    await result.db.beforeEach();
  });

  afterEach(async () => {
    await result.db.afterEach();
    await result.pg.afterEach();
  });

  test('addJob inserts a job into app_jobs.jobs', async () => {
    const job = await addJob(result.pg, 'test-task', { foo: 'bar' });

    expect(job).toBeDefined();
    expect(job.task_identifier).toBe('test-task');
    expect(job.payload).toEqual({ foo: 'bar' });
    expect(job.attempts).toBe(0);
  });

  test('getJob retrieves a job by ID', async () => {
    const created = await addJob(result.pg, 'another-task', { x: 1 });
    const found = await getJob(result.pg, created.id);

    expect(found).toBeTruthy();
    expect(found!.task_identifier).toBe('another-task');
    expect(found!.payload).toEqual({ x: 1 });
  });

  test('getJob returns null for nonexistent job', async () => {
    const found = await getJob(result.pg, 999999999);
    expect(found).toBeNull();
  });

  test('jobs are rolled back between tests (isolation)', async () => {
    await addJob(result.pg, 'isolated-task', {});
    const rows = await result.pg.any(
      `SELECT * FROM app_jobs.jobs WHERE task_identifier = 'isolated-task'`
    );
    expect(rows.length).toBe(1);
  });

  test('previous test job was rolled back', async () => {
    const rows = await result.pg.any(
      `SELECT * FROM app_jobs.jobs WHERE task_identifier = 'isolated-task'`
    );
    expect(rows.length).toBe(0);
  });
});
