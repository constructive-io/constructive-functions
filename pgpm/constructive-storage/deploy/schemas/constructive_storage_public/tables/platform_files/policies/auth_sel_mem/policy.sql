-- Deploy: schemas/constructive_storage_public/tables/platform_files/policies/auth_sel_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/policies/enable_row_level_security


CREATE POLICY auth_sel_mem ON "constructive_storage_public".platform_files
FOR SELECT
TO authenticated
USING (
  database_id IN (SELECT obj.id
  FROM "constructive_memberships_private".org_memberships_sprt AS org_sprt INNER JOIN metaschema_public.database AS obj ON org_sprt.entity_id = obj.owner_id
  WHERE
      org_sprt.actor_id = jwt_public.current_user_id())
);

