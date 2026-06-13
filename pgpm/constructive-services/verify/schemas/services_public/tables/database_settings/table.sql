-- Verify schemas/services_public/tables/database_settings/table

BEGIN;
SELECT 1 FROM "services_public".database_settings WHERE FALSE;
ROLLBACK;
