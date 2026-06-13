-- Verify: schemas/constructive_private/schema
-- made with <3 @ constructive.io

BEGIN;
SELECT pg_catalog.has_schema_privilege('constructive_private', 'usage');
ROLLBACK;
