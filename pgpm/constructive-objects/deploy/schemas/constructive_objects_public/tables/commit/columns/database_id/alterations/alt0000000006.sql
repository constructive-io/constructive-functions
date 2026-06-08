-- Deploy: schemas/constructive_objects_public/tables/commit/columns/database_id/alterations/alt0000000006
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/commit/columns/database_id/column


COMMENT ON COLUMN "constructive_objects_public".commit.database_id IS E'Database scope for multi-tenant isolation';

