-- Verify schemas/services_public/tables/api_modules/table

BEGIN;
SELECT 1 FROM "services_public".api_modules WHERE FALSE;
ROLLBACK;
