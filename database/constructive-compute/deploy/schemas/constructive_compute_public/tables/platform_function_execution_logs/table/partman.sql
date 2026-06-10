-- Deploy: schemas/constructive_compute_public/tables/platform_function_execution_logs/table/partman
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/tables/platform_function_execution_logs/table


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
  ('80203546-1307-d2b7-3203-b304f3ce2c61', '028752cb-510b-1438-2f39-64534bd1cbd7', '68c9e260-c7d4-de5d-237b-ab26ac862465', 'range', 'be79aea3-c893-e16f-d03b-0b9e56c859a1', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

