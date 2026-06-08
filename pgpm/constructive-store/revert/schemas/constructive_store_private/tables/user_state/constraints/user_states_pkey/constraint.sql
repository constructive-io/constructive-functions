-- Revert: schemas/constructive_store_private/tables/user_state/constraints/user_states_pkey/constraint


ALTER TABLE "constructive_store_private".user_state 
  DROP CONSTRAINT user_states_pkey;


