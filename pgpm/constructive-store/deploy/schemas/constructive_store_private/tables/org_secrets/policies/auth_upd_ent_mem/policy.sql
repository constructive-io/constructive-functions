-- Deploy: schemas/constructive_store_private/tables/org_secrets/policies/auth_upd_ent_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table
-- requires: schemas/constructive_store_private/tables/org_secrets/policies/enable_row_level_security


CREATE POLICY auth_upd_ent_mem ON "constructive_store_private".org_secrets
FOR UPDATE
TO authenticated
USING (
  owner_id IN (SELECT org_sprt.entity_id
  FROM "constructive_memberships_private".org_memberships_sprt AS org_sprt
  WHERE
      org_sprt.actor_id = jwt_public.current_user_id() AND (org_sprt.permissions & '0000000000000000000000000000000000000000000000000000010000000000') = '0000000000000000000000000000000000000000000000000000010000000000')
);

