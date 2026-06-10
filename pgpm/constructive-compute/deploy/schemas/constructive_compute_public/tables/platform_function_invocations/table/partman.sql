-- Deploy: schemas/constructive_compute_public/tables/platform_function_invocations/table/partman
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/tables/platform_function_invocations/table


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
  ('4febb492-b8bc-f579-863e-faff0c29e895', '028752cb-510b-1438-2f39-64534bd1cbd7', '8b7f9797-b828-d5a9-7a22-35d32a76e301', 'range', '740747f7-b504-8365-8c61-b98eee1ed795', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

