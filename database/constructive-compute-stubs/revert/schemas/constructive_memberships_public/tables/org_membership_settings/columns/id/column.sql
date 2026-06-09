-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/columns/id/column


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  DROP COLUMN id RESTRICT;


