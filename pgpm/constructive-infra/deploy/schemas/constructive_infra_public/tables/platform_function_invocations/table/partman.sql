-- Deploy: schemas/constructive_infra_public/tables/platform_function_invocations/table/partman
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/tables/platform_function_invocations/table


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
  ('c4814b5e-20ed-6a5f-ce6b-e3396b25e479', '028752cb-510b-1438-2f39-64534bd1cbd7', '07693874-ac43-1c51-b40c-a740c7d5acea', 'range', '5e76937a-f3ae-d49b-21e2-5f8985864d18', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

