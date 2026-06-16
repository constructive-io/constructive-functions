-- Deploy: fixtures/seed_graph_execution_tables
-- made with <3 @ constructive.io

-- requires: fixtures/seed_schemas
-- requires: metaschema-schema:schemas/metaschema_public/tables/table/table

BEGIN;

-- Register merkle store tables (in graph schema) so merkle_store_module FKs resolve.

INSERT INTO metaschema_public."table" (database_id, schema_id, name)
SELECT
  '00000000-0000-0000-0000-000000000000',
  s.id,
  t.name
FROM metaschema_public.schema s
CROSS JOIN (VALUES
  ('platform_function_graph_object'),
  ('platform_function_graph_store'),
  ('platform_function_graph_commit'),
  ('platform_function_graph_ref')
) AS t(name)
WHERE s.database_id = '00000000-0000-0000-0000-000000000000'
  AND s.schema_name = 'constructive_platform_function_graph_public'
ON CONFLICT DO NOTHING;

-- Register graph execution tables (in compute schema) so graph_execution_module FKs resolve.

INSERT INTO metaschema_public."table" (database_id, schema_id, name)
SELECT
  '00000000-0000-0000-0000-000000000000',
  s.id,
  t.name
FROM metaschema_public.schema s
CROSS JOIN (VALUES
  ('platform_function_graphs'),
  ('platform_function_graph_executions'),
  ('platform_function_graph_execution_outputs'),
  ('platform_function_graph_execution_node_states')
) AS t(name)
WHERE s.database_id = '00000000-0000-0000-0000-000000000000'
  AND s.schema_name = 'constructive_compute_public'
ON CONFLICT DO NOTHING;

COMMIT;
