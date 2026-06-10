-- Verify schemas/services_public/tables/api_settings/table

BEGIN;
SELECT 1 FROM "services_public".api_settings WHERE FALSE;
ROLLBACK;
