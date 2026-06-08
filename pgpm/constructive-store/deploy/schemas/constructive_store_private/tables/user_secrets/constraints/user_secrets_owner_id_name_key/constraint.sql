-- Deploy: schemas/constructive_store_private/tables/user_secrets/constraints/user_secrets_owner_id_name_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/table
-- requires: schemas/constructive_store_private/tables/user_secrets/columns/owner_id/column
-- requires: schemas/constructive_store_private/tables/user_secrets/columns/name/column


ALTER TABLE "constructive_store_private".user_secrets 
  ADD CONSTRAINT user_secrets_owner_id_name_key 
    UNIQUE (owner_id, name);

