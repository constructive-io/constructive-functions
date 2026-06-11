-- Verify schemas/services_public/tables/site_themes/table

BEGIN;
SELECT 1 FROM "services_public".site_themes WHERE FALSE;
ROLLBACK;
