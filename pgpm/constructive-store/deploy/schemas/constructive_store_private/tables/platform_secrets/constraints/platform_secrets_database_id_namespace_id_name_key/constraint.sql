-- Deploy: schemas/constructive_store_private/tables/platform_secrets/constraints/platform_secrets_database_id_namespace_id_name_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table
-- requires: schemas/constructive_store_private/tables/platform_secrets/columns/database_id/column
-- requires: schemas/constructive_store_private/tables/platform_secrets/columns/namespace_id/column
-- requires: schemas/constructive_store_private/tables/platform_secrets/columns/name/column


ALTER TABLE "constructive_store_private".platform_secrets 
  ADD CONSTRAINT platform_secrets_database_id_namespace_id_name_key 
    UNIQUE (database_id, namespace_id, name);

