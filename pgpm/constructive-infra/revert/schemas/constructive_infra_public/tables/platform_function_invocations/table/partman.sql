-- Revert: schemas/constructive_infra_public/tables/platform_function_invocations/table/partman


DELETE FROM metaschema_public.partition
WHERE
  table_id = '07693874-ac43-1c51-b40c-a740c7d5acea'::uuid;


