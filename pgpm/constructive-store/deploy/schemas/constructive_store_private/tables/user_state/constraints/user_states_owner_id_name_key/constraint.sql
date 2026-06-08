-- Deploy: schemas/constructive_store_private/tables/user_state/constraints/user_states_owner_id_name_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_state/table
-- requires: schemas/constructive_store_private/tables/user_state/columns/owner_id/column
-- requires: schemas/constructive_store_private/tables/user_state/columns/name/column


ALTER TABLE "constructive_store_private".user_state 
  ADD CONSTRAINT user_states_owner_id_name_key 
    UNIQUE (owner_id, name);

