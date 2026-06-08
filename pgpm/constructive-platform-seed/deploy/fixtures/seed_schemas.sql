-- Deploy: fixtures/seed_schemas
-- made with <3 @ constructive.io

-- requires: fixtures/seed_database
-- requires: metaschema-schema:schemas/metaschema_public/tables/schema/table

BEGIN;

-- Register all module public schemas in metaschema so the API can resolve them.
-- Uses the well-known database ID from seed_database.

INSERT INTO metaschema_public.schema (database_id, name, schema_name, category, is_public)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'constructive_infra_public', 'constructive_infra_public', 'app', true),
  ('00000000-0000-0000-0000-000000000000', 'constructive_store_public', 'constructive_store_public', 'app', true),
  ('00000000-0000-0000-0000-000000000000', 'constructive_objects_public', 'constructive_objects_public', 'app', true),
  ('00000000-0000-0000-0000-000000000000', 'constructive_fbp_public', 'constructive_fbp_public', 'app', true),
  ('00000000-0000-0000-0000-000000000000', 'constructive_storage_public', 'constructive_storage_public', 'app', true)
ON CONFLICT (schema_name) DO NOTHING;

COMMIT;
