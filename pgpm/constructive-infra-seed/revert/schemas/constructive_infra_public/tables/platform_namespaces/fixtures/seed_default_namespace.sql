-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/fixtures/seed_default_namespace
-- made with <3 @ constructive.io

BEGIN;

DELETE FROM constructive_infra_public.platform_namespaces
WHERE name = 'default'
  AND database_id = '00000000-0000-0000-0000-000000000000';

COMMIT;
