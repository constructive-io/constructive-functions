-- Verify: schemas/constructive_compute_public/tables/platform_function_graph_executions/table/partman


SELECT 1
FROM metaschema_public.partition
WHERE
  table_id = '1e6f6b7e-271e-2d01-3fea-f38c589b3ff7'::uuid;


