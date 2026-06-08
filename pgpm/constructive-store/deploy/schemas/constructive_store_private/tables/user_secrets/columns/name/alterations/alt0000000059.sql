-- Deploy: schemas/constructive_store_private/tables/user_secrets/columns/name/alterations/alt0000000059
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/table
-- requires: schemas/constructive_store_private/tables/user_secrets/columns/name/column


ALTER TABLE "constructive_store_private".user_secrets 
  ALTER COLUMN name SET NOT NULL;

