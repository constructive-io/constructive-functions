-- Revert: fixtures/seed_schemas

BEGIN;

DELETE FROM metaschema_public.schema
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND schema_name IN (
    'constructive_users_public',
    'constructive_infra_public',
    'constructive_objects_public',
    'constructive_objects_private',
    'constructive_storage_public',
    'constructive_storage_private',
    'constructive_store_public',
    'constructive_store_private',
    'constructive_compute_public',
    'constructive_compute_private',
    'constructive_platform_function_graph_public',
    'constructive_platform_function_graph_private'
  );

COMMIT;
