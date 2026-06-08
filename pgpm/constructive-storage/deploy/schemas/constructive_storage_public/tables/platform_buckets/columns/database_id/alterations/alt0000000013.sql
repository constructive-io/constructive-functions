-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/columns/database_id/alterations/alt0000000013
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/database_id/column


COMMENT ON COLUMN "constructive_storage_public".platform_buckets.database_id IS E'Database that owns this resource (database-scoped isolation)';

