-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/fixtures/seed_built_in_functions
-- made with <3 @ constructive.io

BEGIN;

INSERT INTO constructive_infra_public.platform_function_definitions
  (name, task_identifier, service_url, is_invocable, is_built_in, scope, description,
   namespace_id, required_secrets, required_configs)
VALUES
  (
    'send-email',
    'send-email',
    'http://localhost:8081',
    true, true, 'platform',
    'Sends transactional emails via Mailgun or SMTP',
    (SELECT id FROM constructive_infra_public.platform_namespaces WHERE name = 'default' AND database_id = '00000000-0000-0000-0000-000000000000'),
    ARRAY[
      ROW('MAILGUN_API_KEY', false),
      ROW('MAILGUN_DOMAIN',  false),
      ROW('MAILGUN_FROM',    false)
    ]::constructive_infra_public.function_requirement[],
    ARRAY[
      ROW('EMAIL_SEND_USE_SMTP',  false),
      ROW('SMTP_HOST',            false),
      ROW('SMTP_PORT',            false),
      ROW('SMTP_FROM',            false),
      ROW('SEND_EMAIL_DRY_RUN',   false)
    ]::constructive_infra_public.function_requirement[]
  ),
  (
    'send-verification-link',
    'send-verification-link',
    'http://localhost:8082',
    true, true, 'platform',
    'Sends invite, password reset, and verification emails',
    (SELECT id FROM constructive_infra_public.platform_namespaces WHERE name = 'default' AND database_id = '00000000-0000-0000-0000-000000000000'),
    ARRAY[
      ROW('MAILGUN_API_KEY', false),
      ROW('MAILGUN_DOMAIN',  false),
      ROW('MAILGUN_FROM',    false),
      ROW('MAILGUN_REPLY',   false)
    ]::constructive_infra_public.function_requirement[],
    ARRAY[
      ROW('EMAIL_SEND_USE_SMTP',              false),
      ROW('SMTP_HOST',                        false),
      ROW('SMTP_PORT',                        false),
      ROW('SMTP_FROM',                        false),
      ROW('LOCAL_APP_PORT',                   false),
      ROW('SEND_VERIFICATION_LINK_DRY_RUN',  false)
    ]::constructive_infra_public.function_requirement[]
  )
ON CONFLICT (scope, name) DO UPDATE SET
  namespace_id     = EXCLUDED.namespace_id,
  required_secrets = EXCLUDED.required_secrets,
  required_configs = EXCLUDED.required_configs,
  description      = EXCLUDED.description;

COMMIT;
