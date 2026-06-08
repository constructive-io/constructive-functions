-- Deploy: schemas/constructive_infra_public/tables/platform_function_execution_logs/table/partman
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/table


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
  ('b686ea10-bced-53ae-a7c9-b6ee8cfeb12f', '028752cb-510b-1438-2f39-64534bd1cbd7', '89329a8f-1c93-87b7-e9e3-4273e74eee2a', 'range', '52068c55-043b-d184-2f42-14c97c4cc425', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

