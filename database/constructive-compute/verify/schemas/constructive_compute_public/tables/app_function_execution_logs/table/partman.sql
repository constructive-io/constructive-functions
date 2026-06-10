-- Verify: schemas/constructive_compute_public/tables/app_function_execution_logs/table/partman


SELECT 1
FROM metaschema_public.partition
WHERE
  table_id = '36d890bb-97f4-1d7c-d50c-5c32fe39891b'::uuid;


