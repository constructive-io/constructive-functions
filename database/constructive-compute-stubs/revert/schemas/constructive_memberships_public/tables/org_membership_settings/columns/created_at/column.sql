-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/columns/created_at/column


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  DROP COLUMN created_at RESTRICT;


