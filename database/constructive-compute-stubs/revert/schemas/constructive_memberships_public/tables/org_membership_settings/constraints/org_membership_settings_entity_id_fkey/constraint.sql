-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/constraints/org_membership_settings_entity_id_fkey/constraint


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  DROP CONSTRAINT org_membership_settings_entity_id_fkey;


