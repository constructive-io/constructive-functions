-- Revert: fixtures/register_graph_execution_module

BEGIN;

DELETE FROM metaschema_modules_public.graph_execution_module
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND scope = 'platform';

DELETE FROM metaschema_modules_public.graph_module
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND prefix = 'platform_function_graph';

DELETE FROM metaschema_modules_public.merkle_store_module
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND prefix = 'platform_function_graph';

COMMIT;
