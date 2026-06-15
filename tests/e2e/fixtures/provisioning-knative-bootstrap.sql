-- ──────────────────────────────────────────────────────────────────────────────
-- Provisioning E2E (Knative) — Minimal DB bootstrap
--
-- Creates just the schemas and tables needed by:
--   1. ComputeModuleLoader (metaschema_modules_public.function_module)
--   2. Provisioning seed (namespace, namespace_secret, function_definitions)
--
-- Does NOT depend on constructive-db-job or pgpm — fully self-contained.
-- ──────────────────────────────────────────────────────────────────────────────

-- pgcrypto for pgp_sym_encrypt / pgp_sym_decrypt (used by secrets handler)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Schemas ─────────────────────────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS metaschema_public;
CREATE SCHEMA IF NOT EXISTS metaschema_modules_public;
CREATE SCHEMA IF NOT EXISTS constructive_compute_public;

-- ─── metaschema_public tables ────────────────────────────────────────────────

CREATE TABLE metaschema_public.database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE metaschema_public.schema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schema_name TEXT NOT NULL
);

CREATE TABLE metaschema_public.namespace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  database_id UUID REFERENCES metaschema_public.database(id)
);

CREATE TABLE metaschema_public.namespace_secret (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace_id UUID NOT NULL REFERENCES metaschema_public.namespace(id),
  key TEXT NOT NULL,
  value BYTEA NOT NULL,
  key_id UUID NOT NULL
);

-- ─── metaschema_modules_public tables (for ComputeModuleLoader) ─────────────

CREATE TABLE metaschema_modules_public.function_module (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  database_id UUID NOT NULL,
  schema_id UUID NOT NULL REFERENCES metaschema_public.schema(id),
  private_schema_id UUID NOT NULL REFERENCES metaschema_public.schema(id),
  definitions_table_name TEXT NOT NULL DEFAULT 'platform_function_definitions',
  secret_definitions_table_name TEXT NOT NULL DEFAULT 'platform_function_secret_definitions',
  scope TEXT DEFAULT 'platform'
);

-- ─── constructive_compute_public tables ─────────────────────────────────────

CREATE TABLE constructive_compute_public.platform_function_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  task_identifier TEXT,
  service_url TEXT,
  runtime TEXT DEFAULT 'container',
  image TEXT,
  concurrency INT DEFAULT 0,
  scale_min INT DEFAULT 0,
  scale_max INT DEFAULT 10,
  timeout_seconds INT DEFAULT 300,
  resources JSONB DEFAULT '{}',
  namespace_id UUID REFERENCES metaschema_public.namespace(id)
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Seed data
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. Database record
INSERT INTO metaschema_public.database (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'provisioning-e2e');

-- 2. Schema records for module loader
INSERT INTO metaschema_public.schema (id, schema_name) VALUES
  ('00000000-0000-0000-0000-000000000010', 'constructive_compute_public'),
  ('00000000-0000-0000-0000-000000000011', 'constructive_compute_private');

-- 3. Function module config → ComputeModuleLoader.load() will resolve this
INSERT INTO metaschema_modules_public.function_module
  (database_id, schema_id, private_schema_id, definitions_table_name)
VALUES
  ('00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000010',
   '00000000-0000-0000-0000-000000000011',
   'platform_function_definitions');

-- 4. Test namespace
INSERT INTO metaschema_public.namespace (id, name, database_id)
VALUES ('00000000-0000-0000-0000-000000000100', 'test-ns',
        '00000000-0000-0000-0000-000000000001');

-- 5. Encrypted secret: TARGET env var for the helloworld-go container.
--    The seed reads pgp_sym_decrypt(value, key_id::text) to decrypt.
INSERT INTO metaschema_public.namespace_secret (namespace_id, key, value, key_id)
VALUES (
  '00000000-0000-0000-0000-000000000100',
  'TARGET',
  pgp_sym_encrypt('Provisioning E2E', '00000000-0000-0000-0000-000000000100'),
  '00000000-0000-0000-0000-000000000100'
);

-- 6. Function definition — uses Knative helloworld-go (publicly available).
--    The seed will create a Knative Service for this function.
INSERT INTO constructive_compute_public.platform_function_definitions
  (id, name, task_identifier, runtime, image,
   concurrency, scale_min, scale_max, timeout_seconds, resources, namespace_id)
VALUES (
  '00000000-0000-0000-0000-000000001000',
  'hello-provisioned',
  'hello:provisioned',
  'container',
  'ghcr.io/knative/helloworld-go:latest',
  0, 0, 1, 300, '{}',
  '00000000-0000-0000-0000-000000000100'
);
