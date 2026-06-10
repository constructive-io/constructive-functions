-- Deploy: schemas/constructive_compute_public/tables/org_function_execution_logs/table/partman
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/tables/org_function_execution_logs/table


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
  ('65f412a7-ad98-0422-e289-c1645c3e2524', '028752cb-510b-1438-2f39-64534bd1cbd7', '573ffbad-c132-a16b-bcf9-9b9e705c050e', 'range', '37248364-46c9-ce93-ebbb-481991760b76', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

