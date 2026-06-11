-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/database_id/alterations/alt0000002483
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/database_id/column


COMMENT ON COLUMN "constructive_storage_public".platform_files.database_id IS E'Database that owns this resource (database-scoped isolation)';

