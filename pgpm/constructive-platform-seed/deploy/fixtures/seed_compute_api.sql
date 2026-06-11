-- Deploy: fixtures/seed_compute_api
-- made with <3 @ constructive.io

-- requires: fixtures/seed_schemas
-- requires: services:schemas/services_public/tables/apis/table
-- requires: services:schemas/services_public/tables/api_schemas/table

BEGIN;

INSERT INTO services_public.apis (database_id, name, role_name, anon_role, is_public)
VALUES ('00000000-0000-0000-0000-000000000000', 'compute', 'authenticated', 'anonymous', true)
ON CONFLICT (database_id, name) DO NOTHING;

INSERT INTO services_public.api_schemas (database_id, api_id, schema_id)
SELECT
  '00000000-0000-0000-0000-000000000000',
  a.id,
  s.id
FROM services_public.apis a
CROSS JOIN metaschema_public.schema s
WHERE a.database_id = '00000000-0000-0000-0000-000000000000'
  AND a.name = 'compute'
  AND s.database_id = '00000000-0000-0000-0000-000000000000'
  AND s.schema_name IN (
    'constructive_users_public',
    'constructive_infra_public',
    'constructive_objects_public',
    'constructive_storage_public',
    'constructive_store_public',
    'constructive_compute_public',
    'constructive_platform_function_graph_public'
  )
ON CONFLICT (api_id, schema_id) DO NOTHING;

COMMIT;
