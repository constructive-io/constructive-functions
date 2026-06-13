-- Verify schemas/services_public/tables/cors_settings/table

BEGIN;
SELECT 1 FROM "services_public".cors_settings WHERE FALSE;
ROLLBACK;
