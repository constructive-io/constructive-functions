-- Deploy: schemas/constructive_store_public/tables/platform_config_definitions/policies/auth_sel_app_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/table
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/policies/enable_row_level_security


CREATE POLICY auth_sel_app_mem ON "constructive_store_public".platform_config_definitions
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1
  FROM "constructive_memberships_private".app_memberships_sprt AS app_sprt
  WHERE
      app_sprt.actor_id = jwt_public.current_user_id() AND app_sprt.is_admin IS TRUE)
);

