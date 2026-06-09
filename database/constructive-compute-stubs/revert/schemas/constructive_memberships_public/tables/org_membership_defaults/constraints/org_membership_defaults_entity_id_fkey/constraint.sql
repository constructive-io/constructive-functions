-- Revert: schemas/constructive_memberships_public/tables/org_membership_defaults/constraints/org_membership_defaults_entity_id_fkey/constraint


ALTER TABLE "constructive_memberships_public".org_membership_defaults 
  DROP CONSTRAINT org_membership_defaults_entity_id_fkey;


