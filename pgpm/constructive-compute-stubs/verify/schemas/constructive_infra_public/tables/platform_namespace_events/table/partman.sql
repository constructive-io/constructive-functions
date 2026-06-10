-- Verify: schemas/constructive_infra_public/tables/platform_namespace_events/table/partman


SELECT 1
FROM metaschema_public.partition
WHERE
  table_id = '064c30f3-e2b2-fb9d-5d89-8f55b3b56e6f'::uuid;


