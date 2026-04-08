-- Provision test-rag database for rag-embedding testing
-- Run with: kubectl exec deploy/postgres -- psql -U postgres -d launchql -f /path/to/this/file
-- Or copy-paste into psql

BEGIN;

-- 1. Create database record
INSERT INTO metaschema_public.database (id, name)
VALUES ('019d618a-a3a9-7926-a399-668bcc6255ba', 'test-rag')
ON CONFLICT (id) DO NOTHING;

-- 2. Create schemas
SELECT metaschema.schema_id('019d618a-a3a9-7926-a399-668bcc6255ba'::uuid, 'public', true);
SELECT metaschema.schema_id('019d618a-a3a9-7926-a399-668bcc6255ba'::uuid, 'private', true);
SELECT metaschema.schema_id('019d618a-a3a9-7926-a399-668bcc6255ba'::uuid, 'app_public', true);
SELECT metaschema.schema_id('019d618a-a3a9-7926-a399-668bcc6255ba'::uuid, 'app_private', true);

-- 3. Create APIs
INSERT INTO services_public.apis (database_id, name, anon_role, role_name, is_public)
VALUES
  ('019d618a-a3a9-7926-a399-668bcc6255ba', 'public', 'anonymous', 'authenticated', true),
  ('019d618a-a3a9-7926-a399-668bcc6255ba', 'admin', 'administrator', 'administrator', true),
  ('019d618a-a3a9-7926-a399-668bcc6255ba', 'private', 'administrator', 'administrator', false),
  ('019d618a-a3a9-7926-a399-668bcc6255ba', 'auth', 'anonymous', 'authenticated', true),
  ('019d618a-a3a9-7926-a399-668bcc6255ba', 'app', 'anonymous', 'authenticated', true)
ON CONFLICT DO NOTHING;

-- 4. Create domains for APIs
INSERT INTO services_public.domains (database_id, api_id, domain, subdomain)
SELECT
  '019d618a-a3a9-7926-a399-668bcc6255ba',
  id,
  'localhost',
  name || '-test-rag'
FROM services_public.apis
WHERE database_id = '019d618a-a3a9-7926-a399-668bcc6255ba'
ON CONFLICT DO NOTHING;

-- 5. Link schemas to APIs
-- Get schema IDs
DO $$
DECLARE
  v_public_schema_id uuid;
  v_private_schema_id uuid;
  v_app_public_schema_id uuid;
  v_app_private_schema_id uuid;
  v_public_api_id uuid;
  v_private_api_id uuid;
  v_admin_api_id uuid;
  v_app_api_id uuid;
BEGIN
  -- Get schema IDs
  SELECT id INTO v_public_schema_id FROM metaschema_public.schema
    WHERE database_id = '019d618a-a3a9-7926-a399-668bcc6255ba' AND name = 'public';
  SELECT id INTO v_private_schema_id FROM metaschema_public.schema
    WHERE database_id = '019d618a-a3a9-7926-a399-668bcc6255ba' AND name = 'private';
  SELECT id INTO v_app_public_schema_id FROM metaschema_public.schema
    WHERE database_id = '019d618a-a3a9-7926-a399-668bcc6255ba' AND name = 'app_public';
  SELECT id INTO v_app_private_schema_id FROM metaschema_public.schema
    WHERE database_id = '019d618a-a3a9-7926-a399-668bcc6255ba' AND name = 'app_private';

  -- Get API IDs
  SELECT id INTO v_public_api_id FROM services_public.apis
    WHERE database_id = '019d618a-a3a9-7926-a399-668bcc6255ba' AND name = 'public';
  SELECT id INTO v_private_api_id FROM services_public.apis
    WHERE database_id = '019d618a-a3a9-7926-a399-668bcc6255ba' AND name = 'private';
  SELECT id INTO v_admin_api_id FROM services_public.apis
    WHERE database_id = '019d618a-a3a9-7926-a399-668bcc6255ba' AND name = 'admin';
  SELECT id INTO v_app_api_id FROM services_public.apis
    WHERE database_id = '019d618a-a3a9-7926-a399-668bcc6255ba' AND name = 'app';

  -- Link schemas to public API
  INSERT INTO services_public.api_schemas (database_id, api_id, schema_id)
  VALUES ('019d618a-a3a9-7926-a399-668bcc6255ba', v_public_api_id, v_public_schema_id)
  ON CONFLICT DO NOTHING;

  -- Link schemas to private API (public + private schemas)
  INSERT INTO services_public.api_schemas (database_id, api_id, schema_id)
  VALUES
    ('019d618a-a3a9-7926-a399-668bcc6255ba', v_private_api_id, v_public_schema_id),
    ('019d618a-a3a9-7926-a399-668bcc6255ba', v_private_api_id, v_private_schema_id)
  ON CONFLICT DO NOTHING;

  -- Link all schemas to admin API
  INSERT INTO services_public.api_schemas (database_id, api_id, schema_id)
  VALUES
    ('019d618a-a3a9-7926-a399-668bcc6255ba', v_admin_api_id, v_public_schema_id),
    ('019d618a-a3a9-7926-a399-668bcc6255ba', v_admin_api_id, v_private_schema_id),
    ('019d618a-a3a9-7926-a399-668bcc6255ba', v_admin_api_id, v_app_public_schema_id),
    ('019d618a-a3a9-7926-a399-668bcc6255ba', v_admin_api_id, v_app_private_schema_id)
  ON CONFLICT DO NOTHING;

  -- Link app schemas to app API
  INSERT INTO services_public.api_schemas (database_id, api_id, schema_id)
  VALUES ('019d618a-a3a9-7926-a399-668bcc6255ba', v_app_api_id, v_app_public_schema_id)
  ON CONFLICT DO NOTHING;
END $$;

-- 6. Create articles table using metaschema
DO $$
DECLARE
  v_public_schema_id uuid;
  v_articles_table_id uuid;
BEGIN
  SELECT id INTO v_public_schema_id FROM metaschema_public.schema
    WHERE database_id = '019d618a-a3a9-7926-a399-668bcc6255ba' AND name = 'public';

  -- Create articles table
  SELECT id INTO v_articles_table_id FROM metaschema.create_table(
    database_id := '019d618a-a3a9-7926-a399-668bcc6255ba'::uuid,
    schema_id := v_public_schema_id,
    name := 'articles',
    category := 'app'
  );

  -- Add fields
  PERFORM metaschema.id(v_articles_table_id);
  PERFORM metaschema.create_field(
    table_id := v_articles_table_id,
    name := 'content',
    type := 'text',
    is_required := false
  );
  PERFORM metaschema.timestamps(v_articles_table_id);

  RAISE NOTICE 'Created articles table: %', v_articles_table_id;
END $$;

-- 7. Create articles_chunks table
DO $$
DECLARE
  v_public_schema_id uuid;
  v_articles_table_id uuid;
  v_chunks_table_id uuid;
BEGIN
  SELECT id INTO v_public_schema_id FROM metaschema_public.schema
    WHERE database_id = '019d618a-a3a9-7926-a399-668bcc6255ba' AND name = 'public';

  SELECT id INTO v_articles_table_id FROM metaschema_public.table
    WHERE database_id = '019d618a-a3a9-7926-a399-668bcc6255ba' AND name = 'articles';

  -- Create articles_chunks table
  SELECT id INTO v_chunks_table_id FROM metaschema.create_table(
    database_id := '019d618a-a3a9-7926-a399-668bcc6255ba'::uuid,
    schema_id := v_public_schema_id,
    name := 'articles_chunks',
    category := 'app'
  );

  -- Add fields
  PERFORM metaschema.id(v_chunks_table_id);
  PERFORM metaschema.create_field(
    table_id := v_chunks_table_id,
    name := 'articles_id',
    type := 'uuid',
    is_required := true
  );
  PERFORM metaschema.create_field(
    table_id := v_chunks_table_id,
    name := 'content',
    type := 'text',
    is_required := true
  );
  PERFORM metaschema.create_field(
    table_id := v_chunks_table_id,
    name := 'chunk_index',
    type := 'integer',
    is_required := false
  );
  PERFORM metaschema.create_field(
    table_id := v_chunks_table_id,
    name := 'embedding',
    type := 'vector',
    is_required := false
  );
  PERFORM metaschema.create_field(
    table_id := v_chunks_table_id,
    name := 'metadata',
    type := 'jsonb',
    is_required := false
  );
  PERFORM metaschema.timestamps(v_chunks_table_id);

  -- Create foreign key to articles
  PERFORM metaschema.create_foreign_key(
    table_id := v_chunks_table_id,
    field_name := 'articles_id',
    ref_table_id := v_articles_table_id
  );

  RAISE NOTICE 'Created articles_chunks table: %', v_chunks_table_id;
END $$;

-- 8. Insert test article
INSERT INTO "test-rag-4f426061-public".articles (id, content)
VALUES (
  '019d618c-8052-782b-8ef9-117ccf5f5e7c',
  'This is a test article about artificial intelligence. AI has transformed many industries including healthcare, finance, and transportation. Machine learning algorithms can now process vast amounts of data to make predictions and decisions.'
)
ON CONFLICT DO NOTHING;

COMMIT;

-- Verify
SELECT 'Database:' as type, id, name FROM metaschema_public.database WHERE id = '019d618a-a3a9-7926-a399-668bcc6255ba';
SELECT 'APIs:' as type, name, is_public FROM services_public.apis WHERE database_id = '019d618a-a3a9-7926-a399-668bcc6255ba';
SELECT 'Schemas:' as type, name, schema_name FROM metaschema_public.schema WHERE database_id = '019d618a-a3a9-7926-a399-668bcc6255ba';
