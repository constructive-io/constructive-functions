-- Verify: grants/standalone_schema_access
-- made with <3 @ constructive.io

BEGIN;

SELECT 1/has_schema_privilege('authenticated', 'constructive_compute_public', 'USAGE')::int;
SELECT 1/has_schema_privilege('authenticated', 'constructive_platform_function_graph_public', 'USAGE')::int;
SELECT 1/has_schema_privilege('authenticated', 'constructive_infra_public', 'USAGE')::int;
SELECT 1/has_schema_privilege('authenticated', 'constructive_users_public', 'USAGE')::int;

ROLLBACK;
