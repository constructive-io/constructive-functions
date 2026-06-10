-- Verify: schemas/constructive_compute_public/tables/app_function_invocations/table/partman


SELECT 1
FROM metaschema_public.partition
WHERE
  table_id = 'f323a97e-5991-1cee-5344-de6df8e73ca4'::uuid;


