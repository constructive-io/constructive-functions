-- Deploy: fixtures/register_compute_log_module
-- made with <3 @ constructive.io

-- requires: fixtures/seed_compute_log_tables

BEGIN;

-- Register the compute_log_module in metaschema so the ComputeLogTracker
-- can discover table names dynamically via ComputeModuleLoader.

INSERT INTO metaschema_modules_public.compute_log_module (
  database_id,
  schema_id,
  private_schema_id,
  compute_log_table_id,
  compute_log_table_name,
  usage_daily_table_id,
  usage_daily_table_name,
  "interval",
  retention,
  premake,
  scope,
  prefix
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  pub.id,
  priv.id,
  cl.id,
  'platform_compute_log',
  ud.id,
  'platform_usage_daily',
  '1 month',
  '12 months',
  3,
  'platform',
  'platform'
FROM metaschema_public.schema pub
JOIN metaschema_public.schema priv
  ON priv.database_id = '00000000-0000-0000-0000-000000000000'
 AND priv.schema_name = 'constructive_compute_private'
JOIN metaschema_public."table" cl
  ON cl.database_id = '00000000-0000-0000-0000-000000000000'
 AND cl.name = 'platform_compute_log'
JOIN metaschema_public."table" ud
  ON ud.database_id = '00000000-0000-0000-0000-000000000000'
 AND ud.name = 'platform_usage_daily'
WHERE pub.database_id = '00000000-0000-0000-0000-000000000000'
  AND pub.schema_name = 'constructive_compute_public'
ON CONFLICT DO NOTHING;

COMMIT;
