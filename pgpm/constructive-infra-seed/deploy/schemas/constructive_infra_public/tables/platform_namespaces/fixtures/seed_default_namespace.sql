-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/fixtures/seed_default_namespace
-- made with <3 @ constructive.io

BEGIN;

INSERT INTO constructive_infra_public.platform_namespaces
  (name, namespace_name, description, is_active, database_id)
VALUES
  ('default', 'default', 'Default platform namespace', true, '00000000-0000-0000-0000-000000000000')
ON CONFLICT (database_id, name) DO NOTHING;

COMMIT;
