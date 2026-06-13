-- Deploy: fixtures/seed_compute_api
-- made with <3 @ constructive.io

-- requires: fixtures/seed_schemas
-- requires: services:schemas/services_public/tables/apis/table
-- requires: services:schemas/services_public/tables/api_schemas/table

-- Mirrors constructive-db's provision_base_modules API structure.
-- Database ID 00000000-... is the well-known nil UUID for standalone/dev.

BEGIN;

-- ─── Public API ──────────────────────────────────────────────────────────────
-- Platform introspection + general app schemas (users, infra, storage, store).
-- Domain: api.localhost
-- Equivalent: provision_base_modules → v_api_id ('api')

INSERT INTO services_public.apis (database_id, name, role_name, anon_role, is_public)
VALUES ('00000000-0000-0000-0000-000000000000', 'api', 'authenticated', 'anonymous', true)
ON CONFLICT (database_id, name) DO NOTHING;

INSERT INTO services_public.api_schemas (database_id, api_id, schema_id)
SELECT
  '00000000-0000-0000-0000-000000000000',
  a.id,
  s.id
FROM services_public.apis a
CROSS JOIN metaschema_public.schema s
WHERE a.database_id = '00000000-0000-0000-0000-000000000000'
  AND a.name = 'api'
  AND s.database_id = '00000000-0000-0000-0000-000000000000'
  AND s.schema_name IN (
    'constructive_users_public',
    'constructive_infra_public',
    'constructive_storage_public',
    'constructive_store_public'
  )
ON CONFLICT (api_id, schema_id) DO NOTHING;

-- ─── Compute API ─────────────────────────────────────────────────────────────
-- Function definitions, invocations, execution logs, secrets, and FBP graph.
-- Domain: compute.localhost
-- Equivalent: provision_base_modules → v_api_compute_id ('compute')
-- COMPUTE_SCHEMAS = ['compute_public', 'compute_fbp_public']

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
    'constructive_compute_public',
    'constructive_platform_function_graph_public'
  )
ON CONFLICT (api_id, schema_id) DO NOTHING;

-- ─── Objects API ─────────────────────────────────────────────────────────────
-- Content-addressed merkle store (objects).
-- Domain: objects.localhost
-- Equivalent: provision_base_modules → v_api_objects_id ('objects')

INSERT INTO services_public.apis (database_id, name, role_name, anon_role, is_public)
VALUES ('00000000-0000-0000-0000-000000000000', 'objects', 'authenticated', 'anonymous', true)
ON CONFLICT (database_id, name) DO NOTHING;

INSERT INTO services_public.api_schemas (database_id, api_id, schema_id)
SELECT
  '00000000-0000-0000-0000-000000000000',
  a.id,
  s.id
FROM services_public.apis a
CROSS JOIN metaschema_public.schema s
WHERE a.database_id = '00000000-0000-0000-0000-000000000000'
  AND a.name = 'objects'
  AND s.database_id = '00000000-0000-0000-0000-000000000000'
  AND s.schema_name IN (
    'constructive_objects_public'
  )
ON CONFLICT (api_id, schema_id) DO NOTHING;

-- ─── Flow API ────────────────────────────────────────────────────────────────
-- Graph module (FBP graph definitions + execution).
-- Domain: flow.localhost
-- Equivalent: provision_base_modules → 'flow' API (populated at runtime)
-- Statically empty in constructive-db; we create it for future use.

INSERT INTO services_public.apis (database_id, name, role_name, anon_role, is_public)
VALUES ('00000000-0000-0000-0000-000000000000', 'flow', 'authenticated', 'anonymous', true)
ON CONFLICT (database_id, name) DO NOTHING;

COMMIT;
