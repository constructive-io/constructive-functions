-- Deploy: fixtures/seed_invocation_tables
-- made with <3 @ constructive.io

-- requires: fixtures/seed_schemas

BEGIN;

-- Register invocation + execution log tables in metaschema.
-- The compute-worker's ComputeModuleLoader needs these for FK references
-- in function_invocation_module.

INSERT INTO metaschema_public."table" (database_id, schema_id, name)
SELECT
  '00000000-0000-0000-0000-000000000000',
  s.id,
  'platform_function_invocations'
FROM metaschema_public.schema s
WHERE s.database_id = '00000000-0000-0000-0000-000000000000'
  AND s.schema_name = 'constructive_compute_public'
ON CONFLICT DO NOTHING;

INSERT INTO metaschema_public."table" (database_id, schema_id, name)
SELECT
  '00000000-0000-0000-0000-000000000000',
  s.id,
  'platform_function_execution_logs'
FROM metaschema_public.schema s
WHERE s.database_id = '00000000-0000-0000-0000-000000000000'
  AND s.schema_name = 'constructive_compute_public'
ON CONFLICT DO NOTHING;

INSERT INTO metaschema_public."table" (database_id, schema_id, name)
SELECT
  '00000000-0000-0000-0000-000000000000',
  s.id,
  'org_function_invocations'
FROM metaschema_public.schema s
WHERE s.database_id = '00000000-0000-0000-0000-000000000000'
  AND s.schema_name = 'constructive_compute_public'
ON CONFLICT DO NOTHING;

INSERT INTO metaschema_public."table" (database_id, schema_id, name)
SELECT
  '00000000-0000-0000-0000-000000000000',
  s.id,
  'org_function_execution_logs'
FROM metaschema_public.schema s
WHERE s.database_id = '00000000-0000-0000-0000-000000000000'
  AND s.schema_name = 'constructive_compute_public'
ON CONFLICT DO NOTHING;

COMMIT;
