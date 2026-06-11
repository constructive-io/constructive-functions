-- Deploy: register_function_module/register
-- made with <3 @ constructive.io

-- requires: constructive-compute:schemas/constructive_compute_public/schema
-- requires: metaschema-modules:schemas/metaschema_modules_public/tables/function_module/table

-- Register function module for both app and org scopes.
-- The compute worker discovers invocation tables via these registrations.

INSERT INTO metaschema_modules_public.function_module (
    database_id,
    scope,
    prefix,
    public_schema_name,
    private_schema_name,
    definitions_table_name,
    secret_definitions_table_name
)
SELECT
    d.id,
    'app',
    'app',
    'constructive_compute_public',
    'constructive_compute_private',
    'platform_function_definitions',
    'platform_secret_definitions'
FROM metaschema_public.database d
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO metaschema_modules_public.function_module (
    database_id,
    scope,
    prefix,
    public_schema_name,
    private_schema_name,
    definitions_table_name,
    secret_definitions_table_name
)
SELECT
    d.id,
    'org',
    'org',
    'constructive_compute_public',
    'constructive_compute_private',
    'platform_function_definitions',
    'platform_secret_definitions'
FROM metaschema_public.database d
LIMIT 1
ON CONFLICT DO NOTHING;
