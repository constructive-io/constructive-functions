-- Deploy: schemas/constructive_compute_private/procedures/rollup_compute_daily
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_public/tables/platform_compute_log/table
-- requires: schemas/constructive_compute_public/tables/platform_usage_daily/table

CREATE FUNCTION constructive_compute_private.rollup_compute_daily(
  since timestamptz DEFAULT now() - interval '2 days'
) RETURNS integer
LANGUAGE sql
AS $$
  WITH agg AS (
    SELECT
      database_id,
      entity_id,
      organization_id,
      entity_type,
      task_identifier,
      completed_at::date AS date,
      count(*)           AS total_calls,
      count(*) FILTER (WHERE status = 'completed') AS successful,
      count(*) FILTER (WHERE status = 'failed')    AS failed,
      coalesce(sum(duration_ms), 0)                AS total_duration_ms,
      min(duration_ms)                             AS min_duration_ms,
      max(duration_ms)                             AS max_duration_ms
    FROM constructive_compute_public.platform_compute_log
    WHERE completed_at >= since
    GROUP BY database_id, entity_id, organization_id, entity_type,
             task_identifier, completed_at::date
  )
  INSERT INTO constructive_compute_public.platform_usage_daily
    (database_id, entity_id, organization_id, entity_type,
     task_identifier, date,
     total_calls, successful, failed,
     total_duration_ms, min_duration_ms, max_duration_ms)
  SELECT
    database_id, entity_id, organization_id, entity_type,
    task_identifier, date,
    total_calls, successful, failed,
    total_duration_ms, min_duration_ms, max_duration_ms
  FROM agg
  ON CONFLICT (database_id, entity_id, task_identifier, date)
  DO UPDATE SET
    total_calls       = EXCLUDED.total_calls,
    successful        = EXCLUDED.successful,
    failed            = EXCLUDED.failed,
    total_duration_ms = EXCLUDED.total_duration_ms,
    min_duration_ms   = EXCLUDED.min_duration_ms,
    max_duration_ms   = EXCLUDED.max_duration_ms,
    organization_id   = EXCLUDED.organization_id,
    entity_type       = EXCLUDED.entity_type
  RETURNING 1
$$;
