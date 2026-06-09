-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/columns/limit_allocation_mode/column


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  DROP COLUMN limit_allocation_mode RESTRICT;


