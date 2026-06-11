-- Verify schemas/services_public/schema

BEGIN;
SELECT pg_catalog.has_schema_privilege('services_public', 'usage');
ROLLBACK;
