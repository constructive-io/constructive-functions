-- Verify: partitions/create_default_partitions

BEGIN;

SELECT 1 FROM pg_class WHERE relname = 'app_function_invocations_default';
SELECT 1 FROM pg_class WHERE relname = 'platform_namespace_events_default';

ROLLBACK;
