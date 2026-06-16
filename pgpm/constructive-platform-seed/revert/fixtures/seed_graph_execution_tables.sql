-- Revert: fixtures/seed_graph_execution_tables

BEGIN;

DELETE FROM metaschema_public."table"
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND name IN (
    'platform_function_graph_object',
    'platform_function_graph_store',
    'platform_function_graph_commit',
    'platform_function_graph_ref',
    'platform_function_graph_executions',
    'platform_function_graph_execution_outputs',
    'platform_function_graph_execution_node_states'
  );

COMMIT;
