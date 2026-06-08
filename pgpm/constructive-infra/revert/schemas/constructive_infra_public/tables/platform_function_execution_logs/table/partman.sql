-- Revert: schemas/constructive_infra_public/tables/platform_function_execution_logs/table/partman


DELETE FROM metaschema_public.partition
WHERE
  table_id = '89329a8f-1c93-87b7-e9e3-4273e74eee2a'::uuid;


