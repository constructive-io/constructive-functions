-- Revert: register_invocation_module/register

BEGIN;

DELETE FROM metaschema_modules_public.function_invocation_module
WHERE database_id = '00000000-0000-0000-0000-000000000000';

COMMIT;
