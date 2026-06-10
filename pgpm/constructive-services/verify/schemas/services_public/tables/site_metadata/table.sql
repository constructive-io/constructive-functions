-- Verify schemas/services_public/tables/site_metadata/table

BEGIN;
SELECT 1 FROM "services_public".site_metadata WHERE FALSE;
ROLLBACK;
