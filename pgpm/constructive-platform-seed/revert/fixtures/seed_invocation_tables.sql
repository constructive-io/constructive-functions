-- Revert: fixtures/seed_invocation_tables

BEGIN;

DELETE FROM metaschema_public."table"
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND name IN (
    'platform_function_invocations',
    'platform_function_execution_logs',
    'org_function_invocations',
    'org_function_execution_logs'
  );

COMMIT;
