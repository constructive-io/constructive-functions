-- Verify: schemas/constructive_infra_public/partitions/create_default_partitions

BEGIN;

SELECT 1 FROM pg_class WHERE relname = 'platform_function_invocations_default';
SELECT 1 FROM pg_class WHERE relname = 'platform_function_execution_logs_default';
SELECT 1 FROM pg_class WHERE relname = 'platform_namespace_events_default';
SELECT 1 FROM pg_class WHERE relname = 'function_graph_executions_default';
SELECT 1 FROM pg_class WHERE relname = 'function_graph_execution_outputs_default';

ROLLBACK;
