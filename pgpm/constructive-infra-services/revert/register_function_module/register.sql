-- Revert: register_function_module/register
-- made with <3 @ constructive.io

DELETE FROM metaschema_modules_public.function_module
WHERE scope = 'platform'
  AND prefix = 'platform'
  AND definitions_table_name = 'platform_function_definitions';
