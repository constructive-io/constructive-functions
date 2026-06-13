-- Verify schemas/services_public/tables/apps/table

BEGIN;
SELECT 1 FROM "services_public".apps WHERE FALSE;
ROLLBACK;
