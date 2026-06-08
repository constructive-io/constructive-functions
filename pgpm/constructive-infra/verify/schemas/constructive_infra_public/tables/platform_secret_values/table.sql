-- Verify: schemas/constructive_infra_public/tables/platform_secret_values/table

BEGIN;

SELECT id, secret_name, configured_value, database_id, created_at, updated_at
FROM constructive_infra_public.platform_secret_values
WHERE false;

ROLLBACK;
