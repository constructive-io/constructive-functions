-- Deploy: schemas/constructive_objects_public/tables/store/columns/database_id/alterations/alt0000002522
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/store/columns/database_id/column


COMMENT ON COLUMN "constructive_objects_public".store.database_id IS E'Database scope for multi-tenant isolation';

