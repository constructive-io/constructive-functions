-- Deploy: schemas/constructive_objects_public/tables/ref/policies/auth_upd_app_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/ref/table
-- requires: schemas/constructive_objects_public/tables/ref/policies/enable_row_level_security


CREATE POLICY auth_upd_app_mem ON "constructive_objects_public".ref
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1
  FROM "constructive_memberships_private".app_memberships_sprt AS app_sprt
  WHERE
      app_sprt.actor_id = jwt_public.current_user_id() AND app_sprt.is_admin IS TRUE)
);

