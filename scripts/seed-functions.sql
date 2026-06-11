-- Seed platform function definitions for local development.
-- Run after deploying the constructive-compute pgpm package.
--
-- Usage:
--   psql -d constructive-functions-db1 -f scripts/seed-functions.sql

BEGIN;

INSERT INTO constructive_compute_public.platform_function_definitions
  (id, name, task_identifier, service_url, is_invocable, is_built_in, max_attempts, priority, queue_name, scope, description, created_at, updated_at)
VALUES
  (
    gen_random_uuid(),
    'send-email',
    'send-email',
    'http://localhost:8081',
    true,
    true,
    3,
    0,
    'default',
    'platform',
    'Sends transactional emails via Mailgun or SMTP',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'send-verification-link',
    'send-verification-link',
    'http://localhost:8082',
    true,
    true,
    3,
    0,
    'default',
    'platform',
    'Sends invite, password reset, and verification emails',
    now(),
    now()
  )
ON CONFLICT DO NOTHING;

COMMIT;
