-- Deploy: schemas/constructive_objects_public/tables/commit/policies/auth_ins_app_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/commit/table
-- requires: schemas/constructive_objects_public/tables/commit/policies/enable_row_level_security


CREATE POLICY auth_ins_app_mem ON "constructive_objects_public".commit
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1
  FROM "constructive_memberships_private".app_memberships_sprt AS app_sprt
  WHERE
      app_sprt.actor_id = jwt_public.current_user_id() AND app_sprt.is_admin IS TRUE)
);

