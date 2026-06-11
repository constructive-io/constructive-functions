-- Deploy: schemas/constructive_store_private/tables/user_secrets/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/table


ALTER TABLE "constructive_store_private".user_secrets 
  ENABLE ROW LEVEL SECURITY;

