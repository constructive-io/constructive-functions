-- Deploy: schemas/constructive_objects_public/tables/store/indexes/idx_store_unique_name
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/store/table
-- requires: schemas/constructive_objects_public/tables/store/columns/database_id/column


CREATE UNIQUE INDEX idx_store_unique_name ON "constructive_objects_public".store ( database_id, (decode(md5(lower(name)), 'hex')) );

