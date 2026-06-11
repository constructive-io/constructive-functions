-- Deploy: schemas/constructive_store_private/tables/platform_secrets/policies/auth_upd_app_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table
-- requires: schemas/constructive_store_private/tables/platform_secrets/policies/enable_row_level_security


CREATE POLICY auth_upd_app_mem ON "constructive_store_private".platform_secrets
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1
  FROM "constructive_memberships_private".app_memberships_sprt AS app_sprt
  WHERE
      app_sprt.actor_id = jwt_public.current_user_id() AND (app_sprt.permissions & '0000000000000000000000000000000000000000000000000000010000000000') = '0000000000000000000000000000000000000000000000000000010000000000')
);

