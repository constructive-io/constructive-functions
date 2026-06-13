-- Verify schemas/services_public/tables/site_modules/table

BEGIN;
SELECT 1 FROM "services_public".site_modules WHERE FALSE;
ROLLBACK;
