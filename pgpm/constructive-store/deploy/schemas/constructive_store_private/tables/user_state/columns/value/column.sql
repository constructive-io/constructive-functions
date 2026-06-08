-- Deploy: schemas/constructive_store_private/tables/user_state/columns/value/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_state/table


ALTER TABLE "constructive_store_private".user_state 
  ADD COLUMN value text;

