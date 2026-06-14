-- Verify: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/table/partman


SELECT 1
FROM metaschema_public.partition
WHERE
  table_id = '64cd7926-8f47-0e02-f4f7-302c82eb3c17'::uuid;


