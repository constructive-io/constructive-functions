-- Revert: schemas/constructive_store_private/tables/user_state/columns/id/column


ALTER TABLE "constructive_store_private".user_state 
  DROP COLUMN id RESTRICT;


