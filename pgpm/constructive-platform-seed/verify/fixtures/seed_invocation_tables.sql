-- Verify: fixtures/seed_invocation_tables

BEGIN;

SELECT 1/count(*)::int
FROM metaschema_public."table"
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND name = 'platform_function_invocations';

ROLLBACK;
