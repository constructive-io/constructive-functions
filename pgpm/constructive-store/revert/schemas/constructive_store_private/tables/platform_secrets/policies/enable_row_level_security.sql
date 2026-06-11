-- Revert: schemas/constructive_store_private/tables/platform_secrets/policies/enable_row_level_security


ALTER TABLE "constructive_store_private".platform_secrets 
  DISABLE ROW LEVEL SECURITY;


