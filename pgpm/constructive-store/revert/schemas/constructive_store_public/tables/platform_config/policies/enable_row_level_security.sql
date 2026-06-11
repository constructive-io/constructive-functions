-- Revert: schemas/constructive_store_public/tables/platform_config/policies/enable_row_level_security


ALTER TABLE "constructive_store_public".platform_config 
  DISABLE ROW LEVEL SECURITY;


