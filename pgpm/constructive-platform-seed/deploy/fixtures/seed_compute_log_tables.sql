-- Deploy: fixtures/seed_compute_log_tables
-- made with <3 @ constructive.io

-- requires: fixtures/seed_schemas

BEGIN;

-- Register compute_log and usage_daily tables in metaschema so
-- compute_log_module can reference them via table IDs.

INSERT INTO metaschema_public."table" (database_id, schema_id, name)
SELECT
  '00000000-0000-0000-0000-000000000000',
  s.id,
  'platform_compute_log'
FROM metaschema_public.schema s
WHERE s.database_id = '00000000-0000-0000-0000-000000000000'
  AND s.schema_name = 'constructive_compute_public'
ON CONFLICT DO NOTHING;

INSERT INTO metaschema_public."table" (database_id, schema_id, name)
SELECT
  '00000000-0000-0000-0000-000000000000',
  s.id,
  'platform_usage_daily'
FROM metaschema_public.schema s
WHERE s.database_id = '00000000-0000-0000-0000-000000000000'
  AND s.schema_name = 'constructive_compute_public'
ON CONFLICT DO NOTHING;

COMMIT;
