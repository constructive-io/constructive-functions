-- Deploy: register_invocation_module/register
-- made with <3 @ constructive.io

-- requires: constructive-compute:schemas/constructive_compute_public/schema
-- requires: metaschema-modules:schemas/metaschema_modules_public/tables/function_invocation_module/table
-- requires: constructive-platform-seed:fixtures/seed_invocation_tables

-- Register invocation modules for both platform and org scopes.
-- The compute worker's InvocationTracker resolves these to find
-- the correct schema and table names for recording invocations.

BEGIN;

-- Platform scope (no owner_id)
INSERT INTO metaschema_modules_public.function_invocation_module (
    database_id,
    schema_id,
    private_schema_id,
    public_schema_name,
    private_schema_name,
    invocations_table_id,
    execution_logs_table_id,
    invocations_table_name,
    execution_logs_table_name,
    scope,
    prefix
)
SELECT
    d.id,
    pub.id,
    priv.id,
    'constructive_compute_public',
    'constructive_compute_private',
    inv.id,
    logs.id,
    'platform_function_invocations',
    'platform_function_execution_logs',
    'platform',
    'platform'
FROM metaschema_public.database d
JOIN metaschema_public.schema pub
  ON pub.database_id = d.id AND pub.schema_name = 'constructive_compute_public'
JOIN metaschema_public.schema priv
  ON priv.database_id = d.id AND priv.schema_name = 'constructive_compute_private'
JOIN metaschema_public."table" inv
  ON inv.database_id = d.id AND inv.schema_id = pub.id AND inv.name = 'platform_function_invocations'
JOIN metaschema_public."table" logs
  ON logs.database_id = d.id AND logs.schema_id = pub.id AND logs.name = 'platform_function_execution_logs'
WHERE d.id = '00000000-0000-0000-0000-000000000000'
ON CONFLICT DO NOTHING;

-- Org scope (with owner_id)
INSERT INTO metaschema_modules_public.function_invocation_module (
    database_id,
    schema_id,
    private_schema_id,
    public_schema_name,
    private_schema_name,
    invocations_table_id,
    execution_logs_table_id,
    invocations_table_name,
    execution_logs_table_name,
    scope,
    prefix
)
SELECT
    d.id,
    pub.id,
    priv.id,
    'constructive_compute_public',
    'constructive_compute_private',
    inv.id,
    logs.id,
    'org_function_invocations',
    'org_function_execution_logs',
    'org',
    'org'
FROM metaschema_public.database d
JOIN metaschema_public.schema pub
  ON pub.database_id = d.id AND pub.schema_name = 'constructive_compute_public'
JOIN metaschema_public.schema priv
  ON priv.database_id = d.id AND priv.schema_name = 'constructive_compute_private'
JOIN metaschema_public."table" inv
  ON inv.database_id = d.id AND inv.schema_id = pub.id AND inv.name = 'org_function_invocations'
JOIN metaschema_public."table" logs
  ON logs.database_id = d.id AND logs.schema_id = pub.id AND logs.name = 'org_function_execution_logs'
WHERE d.id = '00000000-0000-0000-0000-000000000000'
ON CONFLICT DO NOTHING;

COMMIT;
