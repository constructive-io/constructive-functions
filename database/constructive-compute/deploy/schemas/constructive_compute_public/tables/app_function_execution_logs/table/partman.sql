-- Deploy: schemas/constructive_compute_public/tables/app_function_execution_logs/table/partman
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/tables/app_function_execution_logs/table


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
  ('fe44be57-4d68-0d2c-2f2d-20bd6d0e4945', '028752cb-510b-1438-2f39-64534bd1cbd7', '36d890bb-97f4-1d7c-d50c-5c32fe39891b', 'range', 'ae9ad3ee-812c-f8ed-5b69-454933f25978', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

