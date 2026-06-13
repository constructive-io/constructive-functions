-- Revert: schemas/constructive_storage_public/tables/platform_files/policies/enable_row_level_security


ALTER TABLE "constructive_storage_public".platform_files 
  DISABLE ROW LEVEL SECURITY;


