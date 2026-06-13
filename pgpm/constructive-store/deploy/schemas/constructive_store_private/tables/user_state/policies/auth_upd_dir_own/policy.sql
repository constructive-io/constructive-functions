-- Deploy: schemas/constructive_store_private/tables/user_state/policies/auth_upd_dir_own/policy
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_state/table
-- requires: schemas/constructive_store_private/tables/user_state/policies/enable_row_level_security


CREATE POLICY auth_upd_dir_own ON "constructive_store_private".user_state
FOR UPDATE
TO authenticated
USING (
  owner_id = jwt_public.current_user_id()
);

