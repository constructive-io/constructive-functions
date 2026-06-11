-- Verify: fixtures/seed_tables

BEGIN;

SELECT id, schema_id, name
FROM metaschema_public."table"
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND name IN ('platform_function_definitions', 'platform_secret_definitions');

ROLLBACK;
