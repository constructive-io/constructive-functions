-- Deploy: schemas/constructive_infra_public/tables/platform_secret_definitions/fixtures/seed_built_in_secrets
-- made with <3 @ constructive.io

BEGIN;

-- Seed the built-in secret definitions that platform functions depend on.
-- database_id uses a well-known default UUID for standalone/local deployments.
-- Actual secret values are loaded at runtime from .env / env vars.

INSERT INTO constructive_infra_public.platform_secret_definitions
  (name, description, is_built_in, database_id)
VALUES
  ('MAILGUN_API_KEY', 'Mailgun API key for sending transactional emails',           true, '00000000-0000-0000-0000-000000000000'),
  ('MAILGUN_DOMAIN',  'Mailgun sending domain (e.g. mg.example.com)',               true, '00000000-0000-0000-0000-000000000000'),
  ('MAILGUN_FROM',    'Default From address for Mailgun emails',                    true, '00000000-0000-0000-0000-000000000000'),
  ('MAILGUN_REPLY',   'Default Reply-To address for Mailgun emails',                true, '00000000-0000-0000-0000-000000000000'),
  ('MAILGUN_KEY',     'Alias for MAILGUN_API_KEY (legacy compat)',                  true, '00000000-0000-0000-0000-000000000000'),
  ('SMTP_HOST',       'SMTP server hostname (e.g. localhost for Mailpit)',          true, '00000000-0000-0000-0000-000000000000'),
  ('SMTP_PORT',       'SMTP server port (e.g. 1025 for Mailpit)',                  true, '00000000-0000-0000-0000-000000000000'),
  ('SMTP_FROM',       'Default From address for SMTP emails',                      true, '00000000-0000-0000-0000-000000000000')
ON CONFLICT (name) DO NOTHING;

COMMIT;
