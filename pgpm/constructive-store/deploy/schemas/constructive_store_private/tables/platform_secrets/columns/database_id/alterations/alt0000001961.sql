-- Deploy: schemas/constructive_store_private/tables/platform_secrets/columns/database_id/alterations/alt0000001961
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/columns/database_id/column


COMMENT ON COLUMN "constructive_store_private".platform_secrets.database_id IS E'Database that owns this resource (database-scoped isolation)';

