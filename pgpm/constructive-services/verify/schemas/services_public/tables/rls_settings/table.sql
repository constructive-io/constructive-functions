-- Verify schemas/services_public/tables/rls_settings/table

BEGIN;
SELECT 1 FROM "services_public".rls_settings WHERE FALSE;
ROLLBACK;
