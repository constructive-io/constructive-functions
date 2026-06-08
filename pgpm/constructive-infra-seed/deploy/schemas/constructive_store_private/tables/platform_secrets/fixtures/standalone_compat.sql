-- Deploy: schemas/constructive_store_private/tables/platform_secrets/fixtures/standalone_compat
-- made with <3 @ constructive.io
--
-- Standalone compatibility patch for platform_secrets.
--
-- In the monolith, database_id is set by provisioning triggers and the unique
-- constraint evolves across migrations. The slicer extracts the final table
-- state (UNIQUE on database_id, namespace_id, name) but the functions were
-- generated for the earlier schema (UNIQUE on namespace_id, name only).
--
-- This patch bridges the gap for standalone mode:
--   1. DEFAULT on database_id → filled from jwt_private.current_database_id()
--      so INSERT without explicit database_id still populates it.
--   2. Unique index on (namespace_id, name) → matches the ON CONFLICT clause
--      in the generated platform_secrets_set() function.
--
-- Safe for standalone (single database_id). The upstream AST builders will
-- eventually generate entity-aware functions that include database_id directly.

BEGIN;

-- 1. Set DEFAULT on database_id so INSERTs without it use the JWT claim
ALTER TABLE constructive_store_private.platform_secrets
  ALTER COLUMN database_id SET DEFAULT jwt_private.current_database_id();

-- 2. Create unique index matching the ON CONFLICT (namespace_id, name) clause
--    in the generated platform_secrets_set/del functions
CREATE UNIQUE INDEX IF NOT EXISTS platform_secrets_namespace_id_name_idx
  ON constructive_store_private.platform_secrets (namespace_id, name);

COMMIT;
