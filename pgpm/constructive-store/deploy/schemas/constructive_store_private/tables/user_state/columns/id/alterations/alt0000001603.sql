-- Deploy: schemas/constructive_store_private/tables/user_state/columns/id/alterations/alt0000001603
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_state/table
-- requires: schemas/constructive_store_private/tables/user_state/columns/id/column


ALTER TABLE "constructive_store_private".user_state 
  ALTER COLUMN id SET DEFAULT uuidv7();

