-- Verify: schemas/constructive_infra_public/tables/platform_namespaces/fixtures/seed_default_namespace

BEGIN;

SELECT id FROM constructive_infra_public.platform_namespaces WHERE name = 'default';

ROLLBACK;
