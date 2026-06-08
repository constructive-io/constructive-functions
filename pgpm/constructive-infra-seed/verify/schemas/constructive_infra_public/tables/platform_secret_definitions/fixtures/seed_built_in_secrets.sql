-- Verify: schemas/constructive_infra_public/tables/platform_secret_definitions/fixtures/seed_built_in_secrets
-- made with <3 @ constructive.io

BEGIN;

SELECT 1 FROM constructive_infra_public.platform_secret_definitions
WHERE is_built_in = true
  AND name = 'MAILGUN_API_KEY';

ROLLBACK;
