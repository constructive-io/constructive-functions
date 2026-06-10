-- Revert: schemas/constructive_compute_public/tables/org_function_execution_logs/table/partman


DELETE FROM metaschema_public.partition
WHERE
  table_id = '573ffbad-c132-a16b-bcf9-9b9e705c050e'::uuid;


