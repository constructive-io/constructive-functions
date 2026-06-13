-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/policies/auth_upd_own/policy
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table
-- requires: schemas/constructive_storage_public/tables/platform_buckets/policies/enable_row_level_security


CREATE POLICY auth_upd_own ON "constructive_storage_public".platform_buckets
FOR UPDATE
TO authenticated
USING (
  actor_id = jwt_public.current_user_id()
);

