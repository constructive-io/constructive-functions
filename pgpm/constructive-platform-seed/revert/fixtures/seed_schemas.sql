-- Revert: fixtures/seed_schemas

BEGIN;

DELETE FROM metaschema_public.schema
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND schema_name IN (
    'constructive_infra_public',
    'constructive_store_public',
    'constructive_objects_public',
    'constructive_fbp_public',
    'constructive_storage_public'
  );

COMMIT;
