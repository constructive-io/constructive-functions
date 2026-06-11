-- Deploy: schemas/constructive_storage_public/tables/platform_files/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table


ALTER TABLE "constructive_storage_public".platform_files 
  ENABLE ROW LEVEL SECURITY;

