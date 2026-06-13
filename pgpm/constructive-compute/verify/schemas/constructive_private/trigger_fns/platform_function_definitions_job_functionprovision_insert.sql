-- Verify: schemas/constructive_private/trigger_fns/platform_function_definitions_job_functionprovision_insert
-- made with <3 @ constructive.io

BEGIN;
SELECT has_function_privilege('constructive_private.platform_function_definitions_job_functionprovision_insert()', 'execute');
ROLLBACK;
