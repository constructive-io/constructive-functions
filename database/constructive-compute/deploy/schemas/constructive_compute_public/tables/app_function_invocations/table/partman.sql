-- Deploy: schemas/constructive_compute_public/tables/app_function_invocations/table/partman
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/tables/app_function_invocations/table


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
  ('9b245e18-1716-8daa-9e9c-41e29e8c827b', '028752cb-510b-1438-2f39-64534bd1cbd7', 'f323a97e-5991-1cee-5344-de6df8e73ca4', 'range', '5ea3c026-a365-fcb4-902d-74684d3a2e89', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

