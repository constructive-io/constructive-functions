-- Deploy: register_function_module/register
-- made with <3 @ constructive.io

-- requires: constructive-compute:schemas/constructive_compute_public/schema
-- requires: metaschema-modules:schemas/metaschema_modules_public/tables/function_module/table
-- requires: constructive-platform-seed:fixtures/seed_tables

-- Register function module for both app and org scopes.
-- The compute worker discovers invocation tables via these registrations.

INSERT INTO metaschema_modules_public.function_module (
    database_id,
    schema_id,
    private_schema_id,
    definitions_table_id,
    secret_definitions_table_id,
    scope,
    prefix,
    public_schema_name,
    private_schema_name,
    definitions_table_name,
    secret_definitions_table_name
)
SELECT
    d.id,
    pub.id,
    priv.id,
    defs.id,
    sdefs.id,
    'app',
    'app',
    'constructive_compute_public',
    'constructive_compute_private',
    'platform_function_definitions',
    'platform_secret_definitions'
FROM metaschema_public.database d
JOIN metaschema_public.schema pub
  ON pub.database_id = d.id AND pub.schema_name = 'constructive_compute_public'
JOIN metaschema_public.schema priv
  ON priv.database_id = d.id AND priv.schema_name = 'constructive_compute_private'
JOIN metaschema_public."table" defs
  ON defs.database_id = d.id AND defs.schema_id = pub.id AND defs.name = 'platform_function_definitions'
JOIN metaschema_public."table" sdefs
  ON sdefs.database_id = d.id AND sdefs.schema_id = pub.id AND sdefs.name = 'platform_secret_definitions'
WHERE d.id = '00000000-0000-0000-0000-000000000000'
ON CONFLICT DO NOTHING;

INSERT INTO metaschema_modules_public.function_module (
    database_id,
    schema_id,
    private_schema_id,
    definitions_table_id,
    secret_definitions_table_id,
    scope,
    prefix,
    public_schema_name,
    private_schema_name,
    definitions_table_name,
    secret_definitions_table_name
)
SELECT
    d.id,
    pub.id,
    priv.id,
    defs.id,
    sdefs.id,
    'org',
    'org',
    'constructive_compute_public',
    'constructive_compute_private',
    'platform_function_definitions',
    'platform_secret_definitions'
FROM metaschema_public.database d
JOIN metaschema_public.schema pub
  ON pub.database_id = d.id AND pub.schema_name = 'constructive_compute_public'
JOIN metaschema_public.schema priv
  ON priv.database_id = d.id AND priv.schema_name = 'constructive_compute_private'
JOIN metaschema_public."table" defs
  ON defs.database_id = d.id AND defs.schema_id = pub.id AND defs.name = 'platform_function_definitions'
JOIN metaschema_public."table" sdefs
  ON sdefs.database_id = d.id AND sdefs.schema_id = pub.id AND sdefs.name = 'platform_secret_definitions'
WHERE d.id = '00000000-0000-0000-0000-000000000000'
ON CONFLICT DO NOTHING;
