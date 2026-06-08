-- Deploy schemas/constructive_infra_public/tables/platform_function_definitions/fixtures/seed_built_in_functions to pg
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/table

INSERT INTO constructive_infra_public.platform_function_definitions
  (name, task_identifier, service_url, is_invocable, is_built_in, scope, description)
VALUES
  ('send-email',              'send-email',              'http://localhost:8081', true, true, 'platform', 'Sends transactional emails via Mailgun or SMTP'),
  ('send-verification-link',  'send-verification-link',  'http://localhost:8082', true, true, 'platform', 'Sends invite, password reset, and verification emails')
ON CONFLICT DO NOTHING;
