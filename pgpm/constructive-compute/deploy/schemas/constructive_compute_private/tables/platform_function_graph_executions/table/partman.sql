-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/table/partman
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/table


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
  ('38249da6-1578-f91e-0c4a-8c74297f2ada', '028752cb-510b-1438-2f39-64534bd1cbd7', '1e6f6b7e-271e-2d01-3fea-f38c589b3ff7', 'range', '91e0e56f-af9a-d1ba-ca35-760528a7c59a', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

