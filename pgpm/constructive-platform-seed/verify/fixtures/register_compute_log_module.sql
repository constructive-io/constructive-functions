-- Verify: fixtures/register_compute_log_module

BEGIN;

SELECT 1 FROM metaschema_modules_public.compute_log_module
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND scope = 'platform';

ROLLBACK;
