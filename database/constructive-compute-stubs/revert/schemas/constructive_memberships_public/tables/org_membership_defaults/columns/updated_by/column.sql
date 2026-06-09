-- Revert: schemas/constructive_memberships_public/tables/org_membership_defaults/columns/updated_by/column


ALTER TABLE "constructive_memberships_public".org_membership_defaults 
  DROP COLUMN updated_by RESTRICT;


