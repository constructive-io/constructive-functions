-- Revert: fixtures/seed_database

BEGIN;

DELETE FROM metaschema_public.database
WHERE id = '00000000-0000-0000-0000-000000000000';

COMMIT;
