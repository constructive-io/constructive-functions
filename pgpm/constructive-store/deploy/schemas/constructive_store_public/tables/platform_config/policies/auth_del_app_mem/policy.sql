-- Deploy: schemas/constructive_store_public/tables/platform_config/policies/auth_del_app_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config/table
-- requires: schemas/constructive_store_public/tables/platform_config/policies/enable_row_level_security


CREATE POLICY auth_del_app_mem ON "constructive_store_public".platform_config
FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1
  FROM "constructive_memberships_private".app_memberships_sprt AS app_sprt
  WHERE
      app_sprt.actor_id = jwt_public.current_user_id() AND app_sprt.is_admin IS TRUE)
);

