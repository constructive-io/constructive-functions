-- Revert: schemas/constructive_compute_public/tables/org_function_invocations/table/partman


DELETE FROM metaschema_public.partition
WHERE
  table_id = '8799acf7-0878-c41d-47f7-0855ca3ec3e9'::uuid;


