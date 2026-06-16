-- Deploy: fixtures/register_graph_execution_module
-- made with <3 @ constructive.io

-- requires: fixtures/seed_graph_execution_tables
-- requires: metaschema-modules:schemas/metaschema_modules_public/tables/merkle_store_module/table
-- requires: metaschema-modules:schemas/metaschema_modules_public/tables/graph_module/table
-- requires: metaschema-modules:schemas/metaschema_modules_public/tables/graph_execution_module/table

BEGIN;

-- 1. Register merkle_store_module for the platform function graph.

INSERT INTO metaschema_modules_public.merkle_store_module (
    database_id,
    schema_id,
    private_schema_id,
    public_schema_name,
    private_schema_name,
    object_table_id,
    store_table_id,
    commit_table_id,
    ref_table_id,
    prefix,
    scope
)
SELECT
    '00000000-0000-0000-0000-000000000000',
    pub.id,
    priv.id,
    'constructive_platform_function_graph_public',
    'constructive_platform_function_graph_private',
    obj.id,
    store.id,
    cmt.id,
    ref.id,
    'platform_function_graph',
    'platform'
FROM metaschema_public.schema pub
JOIN metaschema_public.schema priv
  ON priv.database_id = '00000000-0000-0000-0000-000000000000'
 AND priv.schema_name = 'constructive_platform_function_graph_private'
JOIN metaschema_public."table" obj
  ON obj.database_id = '00000000-0000-0000-0000-000000000000'
 AND obj.name = 'platform_function_graph_object'
JOIN metaschema_public."table" store
  ON store.database_id = '00000000-0000-0000-0000-000000000000'
 AND store.name = 'platform_function_graph_store'
JOIN metaschema_public."table" cmt
  ON cmt.database_id = '00000000-0000-0000-0000-000000000000'
 AND cmt.name = 'platform_function_graph_commit'
JOIN metaschema_public."table" ref
  ON ref.database_id = '00000000-0000-0000-0000-000000000000'
 AND ref.name = 'platform_function_graph_ref'
WHERE pub.database_id = '00000000-0000-0000-0000-000000000000'
  AND pub.schema_name = 'constructive_platform_function_graph_public'
ON CONFLICT DO NOTHING;

-- 2. Register graph_module for the platform function graph.

INSERT INTO metaschema_modules_public.graph_module (
    database_id,
    public_schema_id,
    private_schema_id,
    public_schema_name,
    private_schema_name,
    merkle_store_module_id,
    scope,
    prefix
)
SELECT
    '00000000-0000-0000-0000-000000000000',
    pub.id,
    priv.id,
    'constructive_platform_function_graph_public',
    'constructive_platform_function_graph_private',
    msm.id,
    'platform',
    'platform_function_graph'
FROM metaschema_public.schema pub
JOIN metaschema_public.schema priv
  ON priv.database_id = '00000000-0000-0000-0000-000000000000'
 AND priv.schema_name = 'constructive_platform_function_graph_private'
JOIN metaschema_modules_public.merkle_store_module msm
  ON msm.database_id = '00000000-0000-0000-0000-000000000000'
 AND msm.prefix = 'platform_function_graph'
WHERE pub.database_id = '00000000-0000-0000-0000-000000000000'
  AND pub.schema_name = 'constructive_platform_function_graph_public'
ON CONFLICT DO NOTHING;

-- 3. Register graph_execution_module for graph execution tracking.

INSERT INTO metaschema_modules_public.graph_execution_module (
    database_id,
    schema_id,
    private_schema_id,
    public_schema_name,
    private_schema_name,
    graph_module_id,
    executions_table_id,
    outputs_table_id,
    node_states_table_id,
    executions_table_name,
    outputs_table_name,
    node_states_table_name,
    scope,
    prefix
)
SELECT
    '00000000-0000-0000-0000-000000000000',
    pub.id,
    priv.id,
    'constructive_compute_public',
    'constructive_compute_private',
    gm.id,
    exec_t.id,
    out_t.id,
    ns_t.id,
    'platform_function_graph_executions',
    'platform_function_graph_execution_outputs',
    'platform_function_graph_execution_node_states',
    'platform',
    'platform'
FROM metaschema_public.schema pub
JOIN metaschema_public.schema priv
  ON priv.database_id = '00000000-0000-0000-0000-000000000000'
 AND priv.schema_name = 'constructive_compute_private'
JOIN metaschema_modules_public.graph_module gm
  ON gm.database_id = '00000000-0000-0000-0000-000000000000'
 AND gm.prefix = 'platform_function_graph'
JOIN metaschema_public."table" exec_t
  ON exec_t.database_id = '00000000-0000-0000-0000-000000000000'
 AND exec_t.name = 'platform_function_graph_executions'
JOIN metaschema_public."table" out_t
  ON out_t.database_id = '00000000-0000-0000-0000-000000000000'
 AND out_t.name = 'platform_function_graph_execution_outputs'
JOIN metaschema_public."table" ns_t
  ON ns_t.database_id = '00000000-0000-0000-0000-000000000000'
 AND ns_t.name = 'platform_function_graph_execution_node_states'
WHERE pub.database_id = '00000000-0000-0000-0000-000000000000'
  AND pub.schema_name = 'constructive_compute_public'
ON CONFLICT DO NOTHING;

COMMIT;
