-- Verify: fixtures/seed_graph_execution_tables

BEGIN;

SELECT 1 FROM metaschema_public."table"
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND name = 'platform_function_graph_object';

SELECT 1 FROM metaschema_public."table"
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND name = 'platform_function_graph_executions';

ROLLBACK;
