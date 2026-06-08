-- Deploy: schemas/constructive_storage_public/tables/platform_files/constraints/platform_files_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/id/column


ALTER TABLE "constructive_storage_public".platform_files 
  ADD CONSTRAINT platform_files_pkey PRIMARY KEY (id);

