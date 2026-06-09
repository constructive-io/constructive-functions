-- Revert: schemas/constructive_memberships_public/tables/org_membership_defaults/columns/entity_id/column


ALTER TABLE "constructive_memberships_public".org_membership_defaults 
  DROP COLUMN entity_id RESTRICT;


