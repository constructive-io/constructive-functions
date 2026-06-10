-- Verify schemas/services_public/tables/apis/table

BEGIN;
SELECT 1 FROM "services_public".apis WHERE FALSE;
ROLLBACK;
