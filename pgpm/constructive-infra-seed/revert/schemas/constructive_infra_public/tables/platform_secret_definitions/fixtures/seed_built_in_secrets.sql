-- Revert: schemas/constructive_infra_public/tables/platform_secret_definitions/fixtures/seed_built_in_secrets
-- made with <3 @ constructive.io

BEGIN;

DELETE FROM constructive_infra_public.platform_secret_definitions
WHERE is_built_in = true
  AND name IN ('MAILGUN_API_KEY', 'MAILGUN_DOMAIN', 'MAILGUN_FROM', 'MAILGUN_REPLY', 'MAILGUN_KEY', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_FROM');

COMMIT;
