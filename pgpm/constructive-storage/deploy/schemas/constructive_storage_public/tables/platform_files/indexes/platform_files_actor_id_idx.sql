-- Deploy: schemas/constructive_storage_public/tables/platform_files/indexes/platform_files_actor_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/actor_id/column


CREATE INDEX platform_files_actor_id_idx ON "constructive_storage_public".platform_files USING BTREE ( actor_id );

