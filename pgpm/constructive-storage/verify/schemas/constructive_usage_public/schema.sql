-- Verify: schemas/constructive_usage_public/schema

BEGIN;
SELECT 1 FROM pg_namespace WHERE nspname = 'constructive_usage_public';
ROLLBACK;
