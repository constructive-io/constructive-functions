-- Verify schemas/services_public/tables/domains/table

BEGIN;
SELECT 1 FROM "services_public".domains WHERE FALSE;
ROLLBACK;
