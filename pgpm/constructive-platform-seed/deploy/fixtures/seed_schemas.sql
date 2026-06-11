-- Deploy: fixtures/seed_schemas
-- made with <3 @ constructive.io

-- requires: fixtures/seed_database
-- requires: metaschema-schema:schemas/metaschema_public/tables/schema/table

BEGIN;

-- Register all module schemas in metaschema so the API can resolve them and
-- modules can look up schema_id / private_schema_id via FK.

INSERT INTO metaschema_public.schema (database_id, name, schema_name, category, is_public)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'constructive_users_public',                    'constructive_users_public',                    'app', true),
  ('00000000-0000-0000-0000-000000000000', 'constructive_infra_public',                    'constructive_infra_public',                    'app', true),
  ('00000000-0000-0000-0000-000000000000', 'constructive_objects_public',                  'constructive_objects_public',                  'app', true),
  ('00000000-0000-0000-0000-000000000000', 'constructive_objects_private',                 'constructive_objects_private',                 'app', false),
  ('00000000-0000-0000-0000-000000000000', 'constructive_storage_public',                  'constructive_storage_public',                  'app', true),
  ('00000000-0000-0000-0000-000000000000', 'constructive_storage_private',                 'constructive_storage_private',                 'app', false),
  ('00000000-0000-0000-0000-000000000000', 'constructive_store_public',                    'constructive_store_public',                    'app', true),
  ('00000000-0000-0000-0000-000000000000', 'constructive_store_private',                   'constructive_store_private',                   'app', false),
  ('00000000-0000-0000-0000-000000000000', 'constructive_compute_public',                  'constructive_compute_public',                  'app', true),
  ('00000000-0000-0000-0000-000000000000', 'constructive_compute_private',                 'constructive_compute_private',                 'app', false),
  ('00000000-0000-0000-0000-000000000000', 'constructive_platform_function_graph_public',  'constructive_platform_function_graph_public',  'app', true),
  ('00000000-0000-0000-0000-000000000000', 'constructive_platform_function_graph_private', 'constructive_platform_function_graph_private', 'app', false)
ON CONFLICT (database_id, name) DO NOTHING;

COMMIT;
