-- Verify: fixtures/seed_database

BEGIN;

SELECT id, name, schema_hash
FROM metaschema_public.database
WHERE id = '00000000-0000-0000-0000-000000000000';

ROLLBACK;
