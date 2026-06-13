-- Revert: schemas/constructive_store_private/tables/user_secrets/policies/enable_row_level_security


ALTER TABLE "constructive_store_private".user_secrets 
  DISABLE ROW LEVEL SECURITY;


