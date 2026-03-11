import type { FunctionContext, FunctionHandler } from '@constructive-io/fn-runtime';
import { getPgPool } from 'pg-cache';

type CleanupType = 'pending_reaper' | 'error_cleanup' | 'unattached_cleanup';

type CleanupParams = {
  type: CleanupType;
};

const BATCH_SIZE = 1000;

const CLEANUP_QUERIES: Record<CleanupType, { query: string; description: string }> = {
  pending_reaper: {
    description: 'Mark stale pending files as error (upload timeout after 24h)',
    query: `
      UPDATE object_store_public.files
      SET status = 'error', status_reason = 'upload timeout'
      WHERE id IN (
        SELECT id FROM object_store_public.files
        WHERE status = 'pending' AND created_at < now() - interval '24 hours'
        LIMIT ${BATCH_SIZE}
      )
    `,
  },
  error_cleanup: {
    description: 'Mark old error files as deleting (expired after 30 days)',
    query: `
      UPDATE object_store_public.files
      SET status = 'deleting', status_reason = 'expired error'
      WHERE id IN (
        SELECT id FROM object_store_public.files
        WHERE status = 'error' AND updated_at < now() - interval '30 days'
        LIMIT ${BATCH_SIZE}
      )
    `,
  },
  unattached_cleanup: {
    description: 'Mark unattached ready files as error (never attached after 7 days)',
    query: `
      UPDATE object_store_public.files
      SET status = 'error', status_reason = 'never attached'
      WHERE id IN (
        SELECT id FROM object_store_public.files
        WHERE status = 'ready' AND source_table IS NULL AND created_at < now() - interval '7 days'
        LIMIT ${BATCH_SIZE}
      )
    `,
  },
};

const handler: FunctionHandler<CleanupParams> = async (
  params: CleanupParams,
  context: FunctionContext
) => {
  const { log, env } = context;

  if (!params.type || !CLEANUP_QUERIES[params.type]) {
    return { error: `Invalid cleanup type: ${params.type}. Must be one of: ${Object.keys(CLEANUP_QUERIES).join(', ')}` };
  }

  const cleanup = CLEANUP_QUERIES[params.type];
  log.info(`[file-cleanup] running ${params.type}: ${cleanup.description}`);

  const pool = getPgPool({
    host: env.PGHOST || 'localhost',
    port: Number(env.PGPORT || 5432),
    database: env.PGDATABASE || 'constructive',
    user: env.PGUSER || 'postgres',
    password: env.PGPASSWORD || 'password',
  });

  const result = await pool.query(cleanup.query);
  const rowsAffected = result.rowCount ?? 0;

  log.info(`[file-cleanup] ${params.type} complete`, { rowsAffected });

  // If we processed a full batch, re-enqueue to handle remaining rows
  if (rowsAffected >= BATCH_SIZE) {
    log.info(`[file-cleanup] batch full (${BATCH_SIZE}), re-enqueuing for next batch`);
    await pool.query(
      `SELECT app_jobs.add_job('file-cleanup', $1::json)`,
      [JSON.stringify({ type: params.type })]
    );
  }

  return { success: true, type: params.type, rowsAffected };
};

export default handler;
