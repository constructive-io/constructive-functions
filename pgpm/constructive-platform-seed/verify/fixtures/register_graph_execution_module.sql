-- Verify: fixtures/register_graph_execution_module

BEGIN;

SELECT 1 FROM metaschema_modules_public.merkle_store_module
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND prefix = 'platform_function_graph';

SELECT 1 FROM metaschema_modules_public.graph_module
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND prefix = 'platform_function_graph';

SELECT 1 FROM metaschema_modules_public.graph_execution_module
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND scope = 'platform';

ROLLBACK;
