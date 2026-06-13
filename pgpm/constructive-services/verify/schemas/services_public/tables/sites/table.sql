-- Verify schemas/services_public/tables/sites/table

BEGIN;
SELECT 1 FROM "services_public".sites WHERE FALSE;
ROLLBACK;
