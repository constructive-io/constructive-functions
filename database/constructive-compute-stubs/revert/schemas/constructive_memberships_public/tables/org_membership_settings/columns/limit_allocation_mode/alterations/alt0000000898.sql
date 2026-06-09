-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/columns/limit_allocation_mode/alterations/alt0000000898


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ALTER COLUMN limit_allocation_mode DROP DEFAULT;


