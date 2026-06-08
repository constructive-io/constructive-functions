-- Deploy: fixtures/seed_database
-- made with <3 @ constructive.io

-- requires: metaschema-schema:schemas/metaschema_public/tables/database/table

BEGIN;

INSERT INTO metaschema_public.database (id, name, schema_hash)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  current_database(),
  'constructive-functions-local'
)
ON CONFLICT (schema_hash) DO NOTHING;

COMMIT;
