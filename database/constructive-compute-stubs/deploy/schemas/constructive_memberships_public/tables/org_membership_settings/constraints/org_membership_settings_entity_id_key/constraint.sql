-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/constraints/org_membership_settings_entity_id_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/table
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/columns/entity_id/column


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ADD CONSTRAINT org_membership_settings_entity_id_key 
    UNIQUE (entity_id);

