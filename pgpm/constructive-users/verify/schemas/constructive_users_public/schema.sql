-- Verify schemas/constructive_users_public/schema

BEGIN;
SELECT pg_catalog.has_schema_privilege('constructive_users_public', 'usage');
ROLLBACK;
