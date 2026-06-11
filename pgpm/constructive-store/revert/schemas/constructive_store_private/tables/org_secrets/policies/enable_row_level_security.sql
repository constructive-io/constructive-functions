-- Revert: schemas/constructive_store_private/tables/org_secrets/policies/enable_row_level_security


ALTER TABLE "constructive_store_private".org_secrets 
  DISABLE ROW LEVEL SECURITY;


