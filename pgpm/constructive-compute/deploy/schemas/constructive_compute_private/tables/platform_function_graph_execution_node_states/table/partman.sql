-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/table/partman
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/table


INSERT INTO metaschema_public.partition (
  id,
  database_id,
  table_id,
  strategy,
  partition_key_id,
  interval,
  retention,
  retention_keep_table,
  premake,
  naming_pattern
)
VALUES
  ('6ed777f7-3f07-669e-7cf7-b3931b57725e', '028752cb-510b-1438-2f39-64534bd1cbd7', '2255833e-646f-3f3c-8299-9f9d1c47a5d8', 'range', '06f5938f-78a1-f2ac-2421-c9175d4f2654', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

