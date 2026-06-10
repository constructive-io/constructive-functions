-- Verify schemas/services_public/tables/api_schemas/table

BEGIN;
SELECT 1 FROM "services_public".api_schemas WHERE FALSE;
ROLLBACK;
