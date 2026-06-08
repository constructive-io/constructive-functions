-- Deploy: register_function_module/register
-- made with <3 @ constructive.io

-- requires: constructive-infra:schemas/constructive_infra_public/schema
-- requires: metaschema-modules:schemas/metaschema_modules_public/tables/function_module/table

INSERT INTO metaschema_modules_public.function_module (
    database_id,
    scope,
    prefix,
    public_schema_name,
    private_schema_name,
    definitions_table_name,
    invocations_table_name,
    execution_logs_table_name,
    secret_definitions_table_name
)
SELECT
    d.id,
    'platform',
    'platform',
    'constructive_infra_public',
    'constructive_infra_private',
    'platform_function_definitions',
    'platform_function_invocations',
    'platform_function_execution_logs',
    'platform_secret_definitions'
FROM metaschema_public.database d
LIMIT 1
ON CONFLICT DO NOTHING;
