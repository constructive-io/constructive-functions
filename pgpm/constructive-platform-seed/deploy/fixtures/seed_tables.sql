-- Deploy: fixtures/seed_tables
-- made with <3 @ constructive.io

-- requires: fixtures/seed_schemas
-- requires: metaschema-schema:schemas/metaschema_public/tables/table/table

BEGIN;

-- Register compute tables in metaschema so modules can reference them via FK.
-- In production, constructive-db's introspection pipeline populates these.

INSERT INTO metaschema_public."table" (database_id, schema_id, name)
SELECT
  '00000000-0000-0000-0000-000000000000',
  s.id,
  'platform_function_definitions'
FROM metaschema_public.schema s
WHERE s.database_id = '00000000-0000-0000-0000-000000000000'
  AND s.schema_name = 'constructive_compute_public'
ON CONFLICT DO NOTHING;

INSERT INTO metaschema_public."table" (database_id, schema_id, name)
SELECT
  '00000000-0000-0000-0000-000000000000',
  s.id,
  'platform_secret_definitions'
FROM metaschema_public.schema s
WHERE s.database_id = '00000000-0000-0000-0000-000000000000'
  AND s.schema_name = 'constructive_compute_public'
ON CONFLICT DO NOTHING;

COMMIT;
