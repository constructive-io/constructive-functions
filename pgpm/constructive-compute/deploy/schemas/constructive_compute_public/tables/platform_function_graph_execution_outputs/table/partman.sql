-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/table/partman
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/table


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
  ('be29cb5b-1998-7dcb-56f3-61e8f55a8c7c', '028752cb-510b-1438-2f39-64534bd1cbd7', '64cd7926-8f47-0e02-f4f7-302c82eb3c17', 'range', 'bf0ea379-9fa4-ea53-67e3-9b5585acae15', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

