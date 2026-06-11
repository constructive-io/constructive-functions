-- Deploy: schemas/constructive_store_private/tables/user_secrets/policies/auth_upd_dir_own/policy
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/table
-- requires: schemas/constructive_store_private/tables/user_secrets/policies/enable_row_level_security


CREATE POLICY auth_upd_dir_own ON "constructive_store_private".user_secrets
FOR UPDATE
TO authenticated
USING (
  owner_id = jwt_public.current_user_id()
);

