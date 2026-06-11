-- Deploy: schemas/constructive_objects_public/tables/ref/policies/auth_sel_rel_ent_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/ref/table
-- requires: schemas/constructive_objects_public/tables/ref/policies/enable_row_level_security


CREATE POLICY auth_sel_rel_ent_mem ON "constructive_objects_public".ref
FOR SELECT
TO authenticated
USING (
  database_id IN (SELECT obj.id
  FROM "constructive_memberships_private".org_memberships_sprt AS org_sprt INNER JOIN metaschema_public.database AS obj ON org_sprt.entity_id = obj.owner_id
  WHERE
      org_sprt.actor_id = jwt_public.current_user_id())
);

